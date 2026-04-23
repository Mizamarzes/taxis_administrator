import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Tarifa } from './tarifa.entity';
import { MediaType } from '../enums/media-tarifa-type.enum';

@Entity('media_tarifas')
export class MediaTarifa extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar', length: 255 })
    title!: string;

    @Column({ type: 'text', nullable: true })
    description!: string;

    @ManyToOne(() => Tarifa, (tarifa: Tarifa) => tarifa.media, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'tarifa_id' })
    tarifa!: Tarifa;

    @Column({ name: 'tarifa_id' })
    tarifaId!: number;

    @Column({ name: 'file_url', type: 'text' })
    fileUrl!: string;

    @Column({
        name: 'media_type',
        type: 'enum',
        enum: MediaType,
        default: MediaType.OTHER,
    })
    mediaType!: MediaType;
}
