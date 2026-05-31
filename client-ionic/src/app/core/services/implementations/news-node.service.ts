import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { NewsService } from '../abstract/news.service';
import { environment } from '../../../../environments/environment';
import { News } from '../../models/news.model';

@Injectable()
export class NewsNodeService extends NewsService {
  // Conecta con http://localhost:3000/api/news
  protected apiUrl = `${environment.nodeApiUrl}/news`;

  async getNews(): Promise<News[]> {
    console.log('[NewsNodeService] getNews llamado');
    this._loading.set(true);

    try {
      const token = await this.authService.getToken();
      let headers = new HttpHeaders();
      if (token) headers = headers.set('Authorization', `Bearer ${token}`);

      const res = await firstValueFrom(
        this.http.get<News[]>(this.apiUrl, { headers })
      );

      // Sincronizamos la señal reactiva
      this._newsList.set(res);
      return res;
    } finally {
      this._loading.set(false);
    }
  }

  async getNewsById(id: string | number): Promise<News> {
    console.log(`[NewsNodeService] getNewsById llamado con ID: ${id}`);
    this._loading.set(true);

    try {
      const token = await this.authService.getToken();
      let headers = new HttpHeaders();
      if (token) headers = headers.set('Authorization', `Bearer ${token}`);

      const res = await firstValueFrom(
        this.http.get<News>(`${this.apiUrl}/${id}`, { headers })
      );

      // Sincronizamos la señal de la noticia seleccionada
      this._selectedNews.set(res);
      return res;
    } finally {
      this._loading.set(false);
    }
  }

  async createNews(news: News): Promise<News> {
    console.log('[NewsNodeService] createNews llamado');
    this._loading.set(true);

    try {
      const token = await this.authService.getToken();
      let headers = new HttpHeaders();
      if (token) headers = headers.set('Authorization', `Bearer ${token}`);

      const createdNews = await firstValueFrom(
        this.http.post<News>(this.apiUrl, news, { headers })
      );

      // 🔥 REACTIVIDAD PURA CON SIGNALS:
      // Insertamos la nueva noticia directamente al principio de la lista actual en memoria
      this._newsList.update((currentNews) => [createdNews, ...currentNews]);

      return createdNews;
    } finally {
      this._loading.set(false);
    }
  }
}
