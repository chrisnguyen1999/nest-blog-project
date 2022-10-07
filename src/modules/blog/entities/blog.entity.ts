import {
    AfterLoad,
    BeforeInsert,
    BeforeUpdate,
    Column,
    Entity,
    ManyToOne,
} from 'typeorm';
import { CommonEntity } from '~/entities';
import { User } from '~/modules/user/entities';
import slugify from 'slugify';

@Entity('blogs')
export class Blog extends CommonEntity {
    @Column({ unique: true })
    title: string;

    @Column({ unique: true })
    slug: string;

    @Column()
    body: string;

    @Column({ nullable: true })
    description?: string;

    @Column()
    imageCover: string;

    @Column({ type: 'simple-array', default: [] })
    images: string[];

    @Column()
    authorId: number;

    @ManyToOne(() => User, author => author.blogs, {
        onDelete: 'CASCADE',
    })
    author: User;

    tempTitle?: string;

    @AfterLoad()
    private updateTempTitle() {
        this.tempTitle = this.title;
    }

    @BeforeInsert()
    private createSlug() {
        this.slug = slugify(this.title);
    }

    @BeforeUpdate()
    private updateSlug() {
        if (this.tempTitle !== this.title) {
            this.slug = slugify(this.title);
        }
    }
}
