import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  routes: Object[] = [
    {
      title: "Home", route: "/", icon: "home"
    }, {
      title: "Documentation", route: "/docs", icon: "library_books"
    }, {
      title: "Style Guide", route: "/style-guide", icon: "color_lens"
    }, {
      title: "Layouts", route: "/layouts", icon: "view_quilt"
    }, {
      title: "Teradata Components", route: "/components", icon: "picture_in_picture"
    }
  ];
}
