import { readdirSync } from "fs";
import path from "path";

export default class ServiceLocator <T extends string = string> {
    private services: {[name: string]: any} = {};

    constructor(folder: string) {
        const servicesInFolder = readdirSync(folder);

        // We'd like to load all services in the folder, while every folder is a service
        servicesInFolder.forEach(service => {
            // Require works only with relative paths
            const relativePath = path.relative(__dirname, `${folder}/${service}`);
            const importedService = require(relativePath);
            
            // It has to be the default export
            const serviceClass: any = importedService.default;

            // We allow the service to set its name. If there's no name, we use the folder name
            this.services[importedService.name || service] = serviceClass;
        });
    }


    public getService(name: T, singleton: boolean = false, options: object = {}): any {
        const nameAsAny = name as any;

        if (singleton) {
            // If the service doesn't have a singleton instance, we'll create one for it
            if (!this.services[nameAsAny].singleton) {                
                this.services[nameAsAny].singleton = new this.services[nameAsAny](options);
            }

            return this.services[nameAsAny].singleton;
        }

        return new this.services[nameAsAny](options);
    }
}