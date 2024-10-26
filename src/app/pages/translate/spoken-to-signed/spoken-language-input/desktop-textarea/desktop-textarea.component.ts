import {HttpClient} from '@angular/common/http';
import {Component, ElementRef, Input, ViewChild} from '@angular/core';
import {FormControl} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {Store} from '@ngxs/store';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-desktop-textarea',
  templateUrl: './desktop-textarea.component.html',
  styleUrls: ['./desktop-textarea.component.scss'],
})
export class DesktopTextareaComponent {
  @Input() maxLength: number;
  @Input() lang: string;
  @Input() textControl: FormControl;
  @ViewChild('textarea') textarea: ElementRef<HTMLTextAreaElement>;

  hoveredSentenceIndex = null;
  sentences$!: Observable<string[]>;
  private urlToTranslate: string | null = null;
  private textSegments: string[] = [];
  private currentSegmentIndex = 0;

  constructor(private store: Store, private http: HttpClient, private route: ActivatedRoute) {
    this.sentences$ = this.store.select<string[]>(state => state.translate.spokenLanguageSentences);
  }
}
