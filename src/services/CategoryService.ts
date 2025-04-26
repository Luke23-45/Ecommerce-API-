// src/services/CategoryService.ts

import { ICategoryRepository, ICategoryDocument } from "../interfaces/Reprository/ICategoryRepository";

export class CategoryService {
    private categoryRepository: ICategoryRepository;

    constructor(categoryRepository: ICategoryRepository) {
        this.categoryRepository = categoryRepository;
    }
    async findCategoryByName(name: string): Promise<ICategoryDocument | null> {
        return this.categoryRepository.findByName(name);
    }

    async createCategory(name: string): Promise<ICategoryDocument> {
        return this.categoryRepository.create({ name: name });
    }

     async findCategoryById(id: string): Promise<ICategoryDocument | null> {
         return this.categoryRepository.findById(id);
     }
}

// export default CategoryService;