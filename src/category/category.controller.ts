import {
  UseInterceptors,
  Controller,
  Post,
  Delete,
  Get,
  Param,
  Body,
  Patch,
  UseGuards,
  NotFoundException,
  Query,
  UploadedFile,
  ParseFilePipe,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import { Request } from 'express';
import { CategoryService } from './category.service';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuardFactory } from 'src/auth/guard/roles.guard';
import userRolesEnum from 'src/user/enums/userRoles.enum';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { UpdateCategoryDto } from './dtos/update-category.dto';
import { CategoryQueryString } from './dtos/category-query-string.dto';

@Controller('/api/v1/categories')
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @Get('/hierarchy')
  async getAllCategoriesHierarchy() {
    const categoryHierarchy = await this.categoryService.getCategoryHierarchy();

    return {
      status: 'success',
      message: 'category hierarchy is received successfully',
      data: {
        categoryHierarchy,
      },
    };
  }

  @Post()
  @UseGuards(AuthGuard, RolesGuardFactory([userRolesEnum.ADMIN]))
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: multer.diskStorage({
        destination: 'public/categories/photos',
        filename: (req: Request, file: Express.Multer.File, cb) => {
          const [fileType, extension] = file.mimetype.split('/');
          let fileName = `${req.body.name}-category-photo-${Date.now()}.${extension}`;
          cb(null, fileName);
        },
      }),
    }),
  )
  async createCategory(
    @Body() dto: CreateCategoryDto,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false,
      }),
    )
    file: Express.Multer.File,
  ) {
    if (file) {
      dto.photo = file.filename;
    }
    const category = await this.categoryService.createCategory(dto);

    return {
      status: 'success',
      message: 'category is created successfully',
      data: {
        category,
      },
    };
  }

  @Delete('/:categoryId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard, RolesGuardFactory([userRolesEnum.ADMIN]))
  async deleteCategory(@Param('categoryId', ParseIntPipe) categoryId: number) {
    const affected = await this.categoryService.deleteCategory(categoryId);

    return {
      status: 'success',
      message: 'category is deleted successfully',
      data: {
        affected,
      },
    };
  }

  @Patch('/:categoryId')
  @UseGuards(AuthGuard, RolesGuardFactory([userRolesEnum.ADMIN]))
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: multer.diskStorage({
        destination: 'public/categories/photos',
        filename: (req: Request, file: Express.Multer.File, cb) => {
          const [fileType, extension] = file.mimetype.split('/');
          let fileName = `${req.body.name}-category-photo-${Date.now()}.${extension}`;
          cb(null, fileName);
        },
      }),
    }),
  )
  async updateCategory(
    @Param('categoryId', ParseIntPipe) categoryId: number,
    @Body() dto: UpdateCategoryDto,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false,
      }),
    )
    file: Express.Multer.File,
  ) {
    if (file) {
      dto.photo = file.filename;
    }
    const affected = await this.categoryService.updateCategory(categoryId, dto);

    return {
      status: 'success',
      message: 'category is updated successfully',
      data: {
        affected,
      },
    };
  }

  @Get('/:categoryId')
  async getOneCategory(@Param('categoryId', ParseIntPipe) categoryId: number) {
    const category = await this.categoryService.getOneCategory(categoryId);

    return {
      status: 'success',
      message: 'category is found successfully',
      data: {
        category,
      },
    };
  }

  @Get()
  async getAllCategories(@Query() queryString: CategoryQueryString) {
    console.log({ queryString });
    const categories = await this.categoryService.getAllCategories(queryString);

    const categoriesCount = await this.categoryService.count();

    return {
      status: 'success',
      message: 'all categories are found successfully',
      data: {
        count: categoriesCount,
        categories,
      },
    };
  }

  @Get(':categoryId/subCategories')
  async getAllSubCategories(@Param('categoryId', ParseIntPipe) categoryId: number) {
    const category =
      await this.categoryService.getOneCategoryWhitAllSubCategoriesAndSubCategories(categoryId);

    return {
      status: 'success',
      message: 'all sub categories are received successfully',
      data: {
        category,
      },
    };
  }

  // @Get(':categoryId/subCategories')
  // async getAllSubCategories(@Param('categoryId', ParseIntPipe) categoryId: number) {
  //   const category = await this.categoryService.getOneCategory(categoryId);

  //   console.log({ category });

  //   const subCategories = await this.categoryService.getAllSubCategories(category);

  //   return {
  //     status: 'success',
  //     message: 'all sub categories are received successfully',
  //     data: {
  //       subCategories,
  //     },
  //   };
  // }
}
