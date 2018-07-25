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

  public overviewCache : {topics: Topic[]};
  public overview : Observable<{topics: Topic[]}>;
 
  constructor(
    private http: HttpClient) { }
 
  /** GET heroes from the server */
  getOverview (): Observable<{topics: Topic[]}> {
    if (this.overviewCache == undefined) {
      this.overview = this.http.get<{topics: Topic[]}>(this.overviewURL);
      this.overview.subscribe(o => this.overviewCache = o);
    }
    return this.overview;
  }

  getExplaination(topic: number, example: number): Observable<string> {
    // todo: actual implementation
    return this.http.get<string>('./assets/xor/example.json');
  }

  getBrief(topic: number, example:number) : BriefExample {
    return this.overviewCache.topics[topic].examples[example];
  }
}