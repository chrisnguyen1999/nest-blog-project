export interface CreateBlog {
    title: string;
    body: string;
    description?: string;
    imageCover: string;
    images?: string[];
}

export type UpdateBlog = Partial<CreateBlog> & { authorId?: number };
