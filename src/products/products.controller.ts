import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
  ParseIntPipe
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ApiOperation, ApiQuery, ApiParam } from '@nestjs/swagger';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Get a paginated list of products' })
  @ApiQuery({ name: 'page', required: false, description: 'Default is 1' })
  @ApiQuery({ name: 'limit', required: false, description: 'Default is 10' })
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.productsService.findAll(pageNum, limitNum);
  }

  @Get(':product_id')
  @ApiOperation({ summary: 'Get a single product by its ID' })
  @ApiParam({
    name: 'product_id',
    description: 'The database ID of the product',
  })
  findOne(@Param('product_id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new product' })
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Put(':product_id')
  @ApiOperation({ summary: 'Update an existing product' })
  update(
    @Param('product_id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':product_id')
  @ApiOperation({ summary: 'Delete a product' })
  remove(@Param('product_id', ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }
}
