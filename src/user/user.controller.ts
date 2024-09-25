import {
  Controller,
  Get,
  UseGuards,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Patch,
  ParseIntPipe,
  Body,
  BadRequestException,
  Req,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { RolesGuardFactory } from 'src/auth/guard/roles.guard';
import userRolesEnum from './enums/userRoles.enum';
import { updateUserNonSensitiveDataByAdminDto } from './dtos/UpdateUserNonSensitiveDataByAdmin.dto';
import { VerifyingRequiredGuard } from 'src/auth/guard/verifyingRequired.guard';
import { updateMeDto } from './dtos/UpdateMe.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from './User.entity';
import { UpdateMyPasswordDto } from './dtos/updateMyPassword.dto';
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserQueryStringDto } from './dtos/user-query-string.dto';

@ApiTags('Users')
@Controller('/api/v1/users')
export class UserController {
  constructor(private usersService: UserService) {}

  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns the list of users',
    type: [User],
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthenticated' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Unauthorizied' })
  @ApiCookieAuth('token')
  @Get('/')
  @UseGuards(AuthGuard, RolesGuardFactory([userRolesEnum.ADMIN]))
  async getAllUsers(@Query() queryString: UserQueryStringDto) {
    const users = await this.usersService.findAll(queryString);
    const usersCount = await this.usersService.count();

    return {
      status: 'success',
      message: 'users are received successfully',
      data: {
        count: usersCount,
        users,
      },
    };
  }

  @ApiOperation({ summary: 'Update Me', description: 'update my profile' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User profile updated successfully',
    type: Number,
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthenticated' })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Verify your mobile number or email first, then try again',
  })
  @ApiCookieAuth('token')
  @UseGuards(AuthGuard)
  @Patch('/updateMe')
  async updateMe(@Body() body: updateMeDto, @CurrentUser() user: User) {
    const affected = await this.usersService.updateMe(user, body);

    return {
      status: 'success',
      message: 'user is updated successfully',
      data: {
        affected,
      },
    };
  }

  @ApiOperation({
    summary: 'Update My password',
    description: 'user can update own password by providing current password and new password',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User password updated successfully',
    type: User,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "your current password you provided doesn't match with your password",
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthenticated' })
  @ApiCookieAuth('token')
  @UseGuards(AuthGuard)
  @Patch('/updateMyPassword')
  async updateMyPassword(@Body() body: UpdateMyPasswordDto, @CurrentUser() user: User) {
    const result = await this.usersService.comparePassword(body.currentPassword, user.password);

    if (!result) {
      throw new BadRequestException(
        "your current password you provided doesn't match with your password",
      );
    }

    const updatedUser = await this.usersService.updateMyPassword(user, body);

    return {
      status: 'success',
      message: 'your password is updated successfully',
      data: {
        user: updatedUser,
      },
    };
  }

  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns the details of the user',
    type: User,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'user is not found by this id' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthenticated' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Unauthorizied' })
  @ApiParam({ type: String, name: 'userId' })
  @ApiCookieAuth('token')
  @UseGuards(AuthGuard, RolesGuardFactory([userRolesEnum.ADMIN]))
  @Get('/:userId')
  async getOneUser(@Param('userId', ParseIntPipe) userId: number) {
    const user = await this.usersService.findById(Number(userId));

    const userWithoutSensitiveData = this.usersService.userWithoutSensitiveData(user);

    return {
      status: 'success',
      message: 'user is found successfully',
      data: {
        user: userWithoutSensitiveData,
      },
    };
  }

  @ApiOperation({ summary: 'Delete user by ID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'user is deleted successfully',
    type: null,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'user is not found by this id' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthenticated' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Unauthorizied' })
  @ApiCookieAuth('token')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard, RolesGuardFactory([userRolesEnum.ADMIN]))
  @Delete('/:userId')
  async deleteOneUser(@Param('userId', ParseIntPipe) userId: number) {
    const affected = await this.usersService.deleteUserById(userId);

    return {
      status: 'success',
      message: 'user is deleted successfully',
      data: {
        affected,
      },
    };
  }

  @ApiOperation({ summary: 'Update user non-sensitive data by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User non-sensitive data updated successfully',
    type: Number,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'user is not found by this id' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'body must not to be empty' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthenticated' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Unauthorizied' })
  @ApiCookieAuth('token')
  @UseGuards(AuthGuard, RolesGuardFactory([userRolesEnum.ADMIN]))
  @Patch('/:userId')
  async updateUserByIdNonSensitiveData(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() body: updateUserNonSensitiveDataByAdminDto,
  ) {
    const affected = await this.usersService.updateUserByIdNonSensitiveData(userId, body);

    return {
      status: 'success',
      message: 'User non-sensitive data updated successfully',
      data: {
        affected,
      },
    };
  }
}
