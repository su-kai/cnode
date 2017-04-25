import { Component, OnInit, Inject, ViewChildren, QueryList, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { UserDetails, Topic } from "../domain/entities"
import { MdlLayoutTabPanelComponent, MdlLayoutContentComponent } from "angular2-mdl"
import { Router } from "@angular/router"
import { Observable, Subject } from 'rxjs/Rx'

@Component({
  selector: 'app-topics',
  templateUrl: './topics.component.html',
  styleUrls: ['./topics.component.css']
})
export class TopicsComponent implements OnInit {
  userDetail: UserDetails = null;
  list: Topic[] = [];
  private pageIndex: number = 1;
  private limit: number = 10;
  private loading: boolean = false;
  constructor( @Inject('user') private userService, @Inject('topics') private topicsService, private router: Router) { }
  @ViewChildren(MdlLayoutTabPanelComponent) tabs: QueryList<MdlLayoutTabPanelComponent>
  @ViewChild(MdlLayoutContentComponent) layContent: MdlLayoutContentComponent
  ngOnInit() {
    this.getUserDetail();
  }
  getUserDetail(): void {
    this.userService.getUserInfo().filter(user => user != null).pluck("loginname").switchMap(name => {
      return this.userService.findUserDetail(name);
    }).subscribe(({ data }) => {
      this.userDetail = Object.assign({}, data);
    })
  }
  private getActiveTab(): MdlLayoutTabPanelComponent {
    return this.tabs.toArray().filter(i => {
      return i.isActive == true;
    })[0]
  }
  tabChanged(e): void {
    //滚动到顶部，重置页数
    this.layContent.el.scrollTop = 0;
    this.pageIndex = 1;
    this.getTopics();
  }

  ngAfterViewInit() {
    this.getTopics()
    this.scrollLoad();
  }
  isBottom(el): boolean {
    //滚动到底部
    return el.scrollHeight - (el.scrollTop + el.clientHeight) <= 100 && !this.loading
  }
  getTopics(): void {
    let tab: MdlLayoutTabPanelComponent = this.getActiveTab();

    this.list = [];
    this.loading = true;
    this.topicsService.getTopicsList(this.pageIndex, this.limit, tab.title).subscribe(res => {
      if (res.success) {
        this.list = [...res.data];
        this.loading = false;
      }
    })
  }
  gotoDetail($event, id): void {
    this.router.navigate([`/detail/${id}`]);
  }
  //滚动加载
  scrollLoad() {
    let scrollElement = this.layContent.el;
    let scroll$ = Observable.fromEvent(scrollElement, "scroll");

    scroll$.throttleTime(200).filter(() => this.isBottom(scrollElement)).map(() => {
      return this.getActiveTab();
    }).concatMap((tab) => {
      this.loading = true;
      return this.topicsService.getTopicsList(++this.pageIndex, this.limit, tab.title);
    }).delay(500).subscribe((res: any) => {
      this.list = [...this.list, ...res.data];
      this.loading = false;
    })
  }
}
