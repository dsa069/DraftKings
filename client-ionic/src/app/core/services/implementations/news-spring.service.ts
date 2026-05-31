import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { NewsService } from '../abstract/news.service';
import { environment } from '../../../../environments/environment';
import { News } from '../../models/news.model';

@Injectable()
export class NewsSpringService extends NewsService {
  // Conecta con http://localhost:8080/playerms/api/news
  protected apiUrl = `${environment.springApiUrl}/playerms/api/news`;

  async getNews(): Promise<News[]> {
    console.log('[NewsSpringService] getNews llamado');
    this._loading.set(true);

    try {
      const token = await this.authService.getToken();
      let headers = new HttpHeaders();
      if (token) headers = headers.set('Authorization', `Bearer ${token}`);

      const res = await firstValueFrom(
        this.http.get<News[]>(this.apiUrl, { headers })
      );
      const cleanedRes = res.map((n) => this.cleanTags(n));

      // Sincronizamos la señal reactiva
      this._newsList.set(cleanedRes);
      return cleanedRes;
    } finally {
      this._loading.set(false);
    }
  }

  async getNewsById(id: string | number): Promise<News> {
    console.log(`[NewsSpringService] getNewsById llamado con ID: ${id}`);
    this._loading.set(true);

    try {
      const token = await this.authService.getToken();
      let headers = new HttpHeaders();
      if (token) headers = headers.set('Authorization', `Bearer ${token}`);

      const res = await firstValueFrom(
        this.http.get<News>(`${this.apiUrl}/${id}`, { headers })
      );
      const cleanedRes = this.cleanTags(res);
      this._selectedNews.set(cleanedRes);
      return cleanedRes;
    } finally {
      this._loading.set(false);
    }
  }

  async createNews(news: News): Promise<News> {
    console.log('[NewsSpringService] createNews llamado');
    this._loading.set(true);

    try {
      const token = await this.authService.getToken();
      let headers = new HttpHeaders();
      if (token) headers = headers.set('Authorization', `Bearer ${token}`);

      const cleanNews = this.cleanTags(news);

      const createdNews = await firstValueFrom(
        this.http.post<News>(this.apiUrl, cleanNews, { headers })
      );

      // 🔥 REACTIVIDAD PURA CON SIGNALS:
      // Insertamos la nueva noticia directamente al principio de la lista actual en memoria
      this._newsList.update((currentNews) => [createdNews, ...currentNews]);
      return createdNews;
    } finally {
      this._loading.set(false);
    }
  }
  private cleanTags(news: News): News {
    if (news.etiquetas) {
      // Por si llega un string puro o un array mal formado, unificamos
      const tags = Array.isArray(news.etiquetas)
        ? news.etiquetas
        : [news.etiquetas as any];

      news.etiquetas = tags
        .flatMap((tag: string) => tag.split(',')) // Separa obligatoriamente por comas
        .map((tag: string) => tag.trim()) // Elimina espacios a los lados
        .filter((tag: string) => tag.length > 0); // Elimina elementos vacíos que dejen las comas seguidas
    }
    return news;
  }
}
