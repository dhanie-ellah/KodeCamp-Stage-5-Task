import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import {
  ApiOperation,
  ApiQuery,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthenticationGuard } from 'src/guards/auth.guard';
import { RolesGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/role.decorator';

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
  @UseGuards(AuthenticationGuard, RolesGuard)
  @Roles(['admin'])
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new product' })
  create(@Body() createProductDto: CreateProductDto, @Req() req:Request) {
    const adminId = req['user'].sub
    return this.productsService.create(createProductDto, adminId);
  }

  @Put(':product_id')
  @UseGuards(AuthenticationGuard, RolesGuard)
  @Roles(['admin'])
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an existing product' })
  update(
    @Param('product_id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':product_id')
  @UseGuards(AuthenticationGuard, RolesGuard)
  @Roles(['admin'])
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a product' })
  remove(@Param('product_id', ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }
}
