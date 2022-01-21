import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, switchMap, tap, pluck } from 'rxjs/operators';

export interface Article{
  title:string;
  url:string;
  source:{
    name:string;
  }
}

interface NewsApiResponse{
  totalResults:number;
  articles:Article[];
}

@Injectable({
  providedIn: 'root'
})
export class NewsApiService {

  private url='https://newsapi.org/v2/top-headlines';
  private pageSize=10;
  private apiKey='e5ed436f90df404c9a4317683fe52829';
  private country='in';

  private pagesInput: Subject<number>;
  pagesOutput:Observable<Article[]>;
  numberOfPages:Subject<number>; 

  constructor(private http:HttpClient) {
    this.numberOfPages=new Subject();

      this.pagesInput=new Subject();
      this.pagesOutput=this.pagesInput.pipe(
        map(page=>{
          return new HttpParams()
          .set('apiKey',this.apiKey)
          .set('country',this.country)
          .set('pageSize',String(this.pageSize))
          .set('page',String(page));
        }),
        switchMap(params=>{
            return this.http.get<NewsApiResponse>(this.url,{params});
        }),
        tap(res=>{
          const totalPages=Math.ceil(res.totalResults/this.pageSize);
          this.numberOfPages.next(totalPages);
        }),
        pluck('articles')
      );
   }

   getPage(page:number){
     this.pagesInput.next(page);
   }
}
