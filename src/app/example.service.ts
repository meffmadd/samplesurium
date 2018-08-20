import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
 
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
 
import { Topic } from './interfaces/topic' 
import { FullExample } from './interfaces/fullexample';
import { BriefExample } from './interfaces/briefexample';
const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};
 
@Injectable({ providedIn: 'root' })
export class ExampleService {
 
  private overviewURL = './assets/overview.json';

  public overview : Observable<{topics: Topic[]}>;
 
  constructor(
    private http: HttpClient) {
      this.getOverview();
    }
 
  /** GET heroes from the server */
  getOverview (): Observable<{topics: Topic[]}> {
    if (this.overview == undefined) {
      this.overview = this.http.get<{topics: Topic[]}>(this.overviewURL);
    }
    return this.overview;
  }
}