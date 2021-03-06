import { Component, OnInit, Inject, transition, trigger, state, style, animate } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { MdlSnackbarService } from "angular2-mdl"
import { Auth, AUTH_TOKEN_KEY } from "../domain/entities"

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  animations: [
    trigger('animated', [
      state('*', style({ transform: 'translateY(0)', opacity: 1 })),
      transition('void => *', [
        style({ transform: 'translateY(-50px)', opacity: 0 }),
        animate('0.5s cubic-bezier(0.215, 0.610, 0.355, 1.000)')
      ]),
      transition('* => void', [
        animate('0.5s cubic-bezier(0.215, 0.610, 0.355, 1.000)', style({
          transform: 'translateY(50px)',
          opacity: 0
        }))
      ])
    ])
  ]
})
export class LoginComponent implements OnInit {
  accessToken: string;
  authToken: string = localStorage.getItem(AUTH_TOKEN_KEY);
  auth: Auth;
  constructor( @Inject('auth') private service,
    private router: Router,
    private mdlSnackbarService: MdlSnackbarService,
    @Inject('user') private userService) { }

  ngOnInit() {
    if (this.authToken) {
      localStorage.clear();
      sessionStorage.clear();
    }
    this.userService.clearUserInfo();
  }
  onSubmit(): void {
    if (!this.accessToken) {
      this.mdlSnackbarService.showToast("accessToken不能为空");
      return;
    }

    this.service.loginWithCredentials(this.accessToken).subscribe(auth => {
      this.auth = Object.assign({}, auth);
      if (!auth.hasError) {
        localStorage.setItem(AUTH_TOKEN_KEY, this.accessToken);
        this.router.navigate([auth.redirectUrl || "/"]);
      }
    }, ({ _body }) => {
      let error = JSON.parse(_body);

      if (!error.success) {
        this.mdlSnackbarService.showToast(`${error.error_msg}`);
      }
    })
  }
}
