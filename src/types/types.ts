import { UserEntity } from "src/user/user.entity";
import z from 'zod'
import { contactSchema, containerSchema, createMemberSchema, createSystemSchema, softwareSchema, updateMemberSchema } from "./schemas";

// Auth Types
export type CreateUserDto = Omit<UserEntity, "id">;
export type LoginUserDto = Omit<Omit<UserEntity, "id">, "username">

export type PasswordResetDto = {
    newPassword: string;
}

// Container Types
export type ContainerInfo = Omit<z.infer<typeof containerSchema>, "containerContent"> 

export type CreateSoftwareDto = z.infer<typeof softwareSchema>


// Project Types
export type CreateNewProjectDto = {
    name: string,
    contacts: string[],
    links: string[],
    category: string,
    type: string,
    status: string
}

export type UpdateProjectDto = {
    name: string,
    contacts: string[],
    links: string[],
    category: string,
    type: string,
    status: string
}

export type CreateProjectDto = {
    title: string,
    description: string,
    
}

export type Contact = z.infer<typeof contactSchema>;

export type CreateSystemDto = z.infer<typeof createSystemSchema>
export interface UpdateSystemDto extends CreateSystemDto { id: string }

export type CreateMemberDto = z.infer<typeof createMemberSchema>;
export type UpdateMemberDto = z.infer<typeof updateMemberSchema>;


// Email Types
export type Inquiry = {
    subject: string,
    text: string,
    to: string,

    context: {
        name: string
    }
}
