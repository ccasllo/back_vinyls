import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BusinnesLogicException, BusinessError } from "../shared/errors/business-errors";
import { Repository } from 'typeorm';
import { Band } from '../band/band.entity';
import { Album } from '../album/album.entity';
import { AlbumDTO } from '../album/album.dto';
import { BandDTO } from '../band/band.dto';
import { PerformerDTO } from '../performer/performer.dto';

@Injectable()
export class AlbumBandService {
    constructor(
        @InjectRepository(Band)
        private readonly bandRepository: Repository<Band>,

        @InjectRepository(Album)
        private readonly albumRepository: Repository<Album>) { }

    async addAlbumBand(bandId: number, albumId: number): Promise<AlbumDTO> {
        const band = await this.bandRepository.findOne(bandId);
        if (!band)
            throw new BusinnesLogicException("The band with the given id was not found", BusinessError.NOT_FOUND)

        const album = await this.albumRepository.findOne(albumId, { relations: ["performers"] });
        if (!album)
            throw new BusinnesLogicException("The album with the given id was not found", BusinessError.NOT_FOUND)

        album.performers = [band];
        return await this.albumRepository.save(album);
    }

    async findBandsByAlbumIdBandId(bandId: number, albumId: number): Promise<PerformerDTO> {
        const band = await this.bandRepository.findOne(bandId);
        if (!band)
            throw new BusinnesLogicException("The band with the given id was not found", BusinessError.NOT_FOUND)

        const album = await this.albumRepository.findOne(albumId, { relations: ["performers"] });
        if (!album)
            throw new BusinnesLogicException("The album with the given id was not found", BusinessError.NOT_FOUND)

        const albumband = album.performers.find(e => e.id === band.id);

        if (!albumband)
            throw new BusinnesLogicException("The band with the given id is not associated to the album", BusinessError.PRECONDITION_FAILED)

        return albumband;
    }

    async associateAlbumBand(albumId: number, bandDTO: BandDTO[]): Promise<AlbumDTO> {
        const album = await this.albumRepository.findOne(albumId, { relations: ["performers"] });

        if (!album)
            throw new BusinnesLogicException("The album with the given id was not found", BusinessError.NOT_FOUND)

        let bands: Band[] = [];

        for (let i = 0; i < bandDTO.length; i++) {
            const band = await this.bandRepository.findOne(bandDTO[i].id);
            if (!band)
                throw new BusinnesLogicException("The band with the given id was not found", BusinessError.NOT_FOUND)

            const newBand = new Band();
            newBand.id = bandDTO[i].id;
            newBand.name = bandDTO[i].name;
            newBand.image = bandDTO[i].image;
            newBand.description = bandDTO[i].description;
            newBand.creationDate = bandDTO[i].creationDate;
            bands.push(newBand);
        }

        album.performers = bands;
        return await this.albumRepository.save(album);
    }

    async findBandsByAlbumId(albumId: number): Promise<PerformerDTO[]> {
        const album = await this.albumRepository.findOne(albumId, { relations: ["performers"] });
        if (!album)
            throw new BusinnesLogicException("The album with the given id was not found", BusinessError.NOT_FOUND)

        return album.performers;
    }

    async deleteBandToAlbum(bandId: number, albumId: number): Promise<AlbumDTO> {
        const band = await this.bandRepository.findOne(bandId);
        if (!band)
            throw new BusinnesLogicException("The band with the given id was not found", BusinessError.NOT_FOUND)

        const album = await this.albumRepository.findOne(albumId, { relations: ["performers"] });
        if (!album)
            throw new BusinnesLogicException("The album with the given id was not found", BusinessError.NOT_FOUND)

        album.performers = album.performers.filter(e => e.id !== bandId);

        return await this.albumRepository.save(album);
    }
}