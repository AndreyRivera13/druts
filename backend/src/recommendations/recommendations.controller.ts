import { Controller, Get, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RecommendationsService } from './recommendations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('recommendations')
@Controller('recommendations')
export class RecommendationsController {
  constructor(private recommendationsService: RecommendationsService) {}

  @Get('frequently-bought-together/:productId')
  @ApiOperation({ summary: '"También compraron" — filtrado colaborativo' })
  frequentlyBoughtTogether(
    @Param('productId') productId: string,
    @Query('limit') limit = 6,
  ) {
    return this.recommendationsService.getFrequentlyBoughtTogether(productId, +limit);
  }

  @Get('similar/:productId')
  @ApiOperation({ summary: 'Productos similares por categoría' })
  similar(@Param('productId') productId: string, @Query('limit') limit = 6) {
    return this.recommendationsService.getSimilar(productId, +limit);
  }

  @Get('personalized')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Recomendaciones personalizadas basadas en historial' })
  personalized(@Request() req, @Query('limit') limit = 8) {
    return this.recommendationsService.getPersonalized(req.user.userId, +limit);
  }

  @Get('insights')
  @ApiOperation({ summary: 'Insights de recomendaciones' })
  insights() {
    return this.recommendationsService.getInsights();
  }
}
