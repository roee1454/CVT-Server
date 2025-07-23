import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException, StreamableFile } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FileEntity } from './files.entity';
import { Like, Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { Response } from 'express';
import * as AdmZip from 'adm-zip'


@Injectable()
export class FilesService {
    private readonly logger = new Logger(FilesService.name);
    
    constructor(
        @InjectRepository(FileEntity) 
        private readonly fileRepository: Repository<FileEntity>
    ) {}
    
    public async uploadFiles(files: Express.Multer.File[]): Promise<FileEntity[]> {
        this.logger.log(`Starting upload process for ${files.length} files`);
        
        if (!files || files.length === 0) {
            this.logger.warn('No files provided for upload');
            return [];
        }
        
        const uploadedFiles: FileEntity[] = [];
        
        try {
            const uploadPromises = files.map(async file => {
                this.logger.debug(`Processing file: ${file.originalname} (${file.mimetype}, ${file.size} bytes)`);
                
                try {
                    const fileEntity = this.fileRepository.create({
                        filename: Buffer.from(file.filename, "latin1").toString("utf8"),
                        mimetype: file.mimetype,
                        size: file.size,
                        destination: file.destination,
                        path: file.path,
                        originalName: Buffer.from(file.originalname, "latin1").toString("utf8") || "",
                        uploadedAt: new Date(),
                    });
                    
                    const savedFile = await this.fileRepository.save(fileEntity);
  
                    this.logger.log(`Successfully saved file to database: ${file.filename}`);
                    uploadedFiles.push(savedFile);
                    return savedFile;
                    
                } catch (error) {
                    this.logger.error(`Failed to save file ${file.originalname} to database: ${error.message}`, error.stack);
                    
                    try {
                        const filePath = path.join(file.destination, file.filename);
                        if (fs.existsSync(filePath)) {
                            fs.unlinkSync(filePath);
                            this.logger.log(`Removed physical file after failed database insertion: ${filePath}`);
                        }
                    } catch (fsError) {
                        this.logger.error(`Failed to clean up file after error: ${fsError.message}`);
                    }
                    
                    throw error;
                }
            });
            
            await Promise.all(uploadPromises);
            this.logger.log(`Successfully uploaded ${uploadedFiles.length} files`);
            
            return uploadedFiles;
            
        } catch (error) {
            this.logger.error(`Error during batch file upload: ${error.message}`, error.stack);
            throw new BadRequestException(`Failed to upload files: ${error.message}`);
        }
    }

    public async getFiles(
        directory: string,
    ): Promise<{ files: FileEntity[], total: number }> {
        this.logger.log(`Fetching files from directory: ${directory}`);
        
        try {
            const whereConditions: any = {};
            
            if (directory) {
                if (directory.endsWith('%')) {
                    whereConditions.destination = Like(directory);
                } else {
                    const normalizedDirectory = directory.replace(/\\/g, '/').replace(/\/$/, '');
                    whereConditions.destination = Like(`${normalizedDirectory}%`);
                }
            }
            
            const queryBuilder = this.fileRepository.createQueryBuilder('file')
                .where(whereConditions);
            
            const total = await queryBuilder.getCount();
            const files = await queryBuilder.getMany();
            
            this.logger.log(`Found ${files.length} files (total: ${total})`);
            
            return { files, total };
            
        } catch (error) {
            this.logger.error(`Failed to fetch files from directory ${directory}: ${error.message}`, error.stack);
            throw new BadRequestException(`Failed to fetch files: ${error.message}`);
        }
    }

    public async getFileById(id: string): Promise<FileEntity> {
        this.logger.log(`Fetching file with ID: ${id}`);
        
        const file = await this.fileRepository.findOne({ where: { id } });
        
        if (!file) {
            this.logger.warn(`File not found with ID: ${id}`);
            throw new NotFoundException(`File with ID ${id} not found`);
        }
        
        return file;
    }

    public async viewFileById(id: string, response: Response) {
        this.logger.log(`Fetching file with ID: ${id}`);
        const file = await this.fileRepository.findOne({ where: { id } });

        if (!file) {
            this.logger.warn(`File not found with ID: ${id}`);
            throw new NotFoundException(`File with ID ${id} not found`);
        }

        return response.sendFile(path.join(process.cwd(), file.path));
    }

    public async downloadFileById(id: string) {
        this.logger.log(`Fetching file with ID: ${id}`);
        
        const file = await this.fileRepository.findOne({ where: { id } });
        
        if (!file) {
            this.logger.warn(`File not found with ID: ${id}`);
            throw new NotFoundException(`File with ID ${id} not found`);
        }
        
        try {
            if (!fs.existsSync(file.path)) {
                this.logger.warn(`File exists in database but not found on disk at: ${file.path}`);
                throw new NotFoundException('File not found on server');
            }
            
            this.logger.log(`Sent file with id: "${file.id}" to the client successfully!`)

            const stream = fs.createReadStream(path.join(process.cwd(), file.path));

            stream.on("close", () => {
                stream.destroy();
            })

            return new StreamableFile(stream, { disposition: `attachment; filename="${encodeURIComponent(file.originalName)}"` }).setErrorHandler((err) => this.logger.error(`Error while streaming file: ${err.message}`))
        } catch (error) {
            this.logger.error(`Error sending file: ${error.message}`);
            throw new InternalServerErrorException(error);
        }
    }
    
    public async downloadZipFromDirectory(directory: string) {
        if (!fs.existsSync(directory)) {
            this.logger.log("Project directory does not exist, created it!")
            fs.mkdirSync(directory, { recursive: true });
        }

        const targetFilePath = `${directory}/zip/all-files.zip`
        const zip = new AdmZip();
        const files = fs.readdirSync(directory);

        this.logger.log(files)

        for (const file of files) {
            const filePath = path.join(directory, file);
            const fileStats = fs.statSync(filePath);

            if (fileStats.isFile()) {
                zip.addLocalFile(filePath);
                this.logger.log(`Added file: "${file}" to the archive`)
            }
        }

        zip.writeZip(targetFilePath, (err) => {
            if (err) {
                this.logger.error(`Error while archiving files: ${err.message}`);
                throw new InternalServerErrorException(err.message)
            }
        })

        
        const stream = fs.createReadStream(targetFilePath);
        return new StreamableFile(stream, { disposition: `attachment; filename="all-files.zip"` })
    }

    public async removeFile(fileId: string): Promise<{ 
        success: boolean; 
        message: string; 
        file: Partial<FileEntity>;
    }> {
        this.logger.log(`Starting file removal for: ${fileId}`);
        
        try {            
            const fileEntity = await this.fileRepository.findOne({ 
                where: { id: fileId }
            });
            
            if (!fileEntity) {
                this.logger.warn(`File not found in database: ${fileId}`);
                throw new NotFoundException(`File not found: ${fileId}`);
            }
            
            this.logger.log(`Removing file from filesystem: ${fileEntity.path}`);
            
            try {
                if (fs.existsSync(fileEntity.path)) {
                    fs.unlinkSync(fileEntity.path);
                    this.logger.log(`File removed from filesystem successfully`);
                } else {
                    this.logger.warn(`File not found in filesystem: ${fileEntity.path}`);
                }
            } catch (fsError) {
                this.logger.error(`Error removing file from filesystem: ${fsError.message}`, fsError.stack);
            }
            
            this.logger.log(`Removing file from database with ID: ${fileEntity.id}`);
            const deleteResult = await this.fileRepository.delete(fileEntity.id);
            
            if (deleteResult.affected === 0) {
                throw new BadRequestException(`Failed to remove file from database: ${fileId}`);
            }
            
            this.logger.log(`File removed successfully from database: ${fileId}`);
            
            return {
                success: true,
                message: `File ${fileEntity.originalName} removed successfully`,
                file: { ...fileEntity }
            };
        } catch (error) {
            this.logger.error(`Error removing file: ${error.message}`, error.stack);
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException(`Failed to remove file: ${error.message}`);
        }
    }
    
    public async removeFilesByDirectory(directory: string): Promise<{
        success: boolean;
        message: string;
        removedCount: number;
        failedCount: number;
    }> {
        this.logger.log(`Starting bulk file removal from directory: ${directory}`);
        
        try {
            const { files } = await this.getFiles(directory);
            
            if (files.length === 0) {
                return {
                    success: true,
                    message: `No files found in directory: ${directory}`,
                    removedCount: 0,
                    failedCount: 0
                };
            }
            
            let removedCount = 0;
            let failedCount = 0;
            
            for (const file of files) {
                const fileUrl = path.join(file.destination, file.filename);
                
                try {
                    await this.removeFile(fileUrl);
                    removedCount++;
                } catch (error) {
                    this.logger.error(`Failed to remove file ${fileUrl}: ${error.message}`);
                    failedCount++;
                }
            }
            
            return {
                success: true,
                message: `Removed ${removedCount} files from directory ${directory}` + 
                         (failedCount > 0 ? ` (${failedCount} failed)` : ''),
                removedCount,
                failedCount
            };
            
        } catch (error) {
            this.logger.error(`Error during bulk file removal: ${error.message}`, error.stack);
            throw new BadRequestException(`Failed to remove files: ${error.message}`);
        }
    }
}