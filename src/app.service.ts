import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
    helloWorld() {
        return "Hello World!"
    }
} 