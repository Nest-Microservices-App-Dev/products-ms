import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from 'generated/prisma';
import { PaginationDto } from 'src/common';
import { resourceUsage } from 'process';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('ProductsService');
  onModuleInit() {
    this.$connect();
    this.logger.log('Connected to the database');
  }
  create(createProductDto: CreateProductDto) {
  
    return this.product.create(
      {
        data: createProductDto
      }
    );
  }

  async findAll(paginationDto: PaginationDto) {
    const { page = 1 , limit = 10 } = paginationDto;
    const totalPages = await this.product.count(
      {
        where: {
          available: true
        }
      }
    );
    const lastPage = Math.ceil(totalPages / limit);
    const result  =  await this.product.findMany(
      {
        skip: (page - 1) * limit,
        take: limit,
        where: {
          available: true
        },
      }
    );
    return {
      data: result,
      meta: {
        total: totalPages,
        page: page,
        lastPage: lastPage,
      }
    }
  }

  async findOne(id: number) {
    const result =  await this.product.findUnique({
      where: {
        id,
        available: true
      }
    });
    if (!result) {
      throw new NotFoundException('Product not found');
    }
    return result;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const { id: __, ...data } = updateProductDto;
    await this.findOne(id);
   
    const result = await this.product.update({
      where: {
        id
      },
      data: data
    });

    return result;

  }

  async remove(id: number) {
    await this.findOne(id);
    const result = await this.product.update({
      where: {
        id
      },
      data: {
        available: false
      }
    });
    return result;
  }
}
