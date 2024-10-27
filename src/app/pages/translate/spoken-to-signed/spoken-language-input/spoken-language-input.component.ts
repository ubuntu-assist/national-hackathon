import {HttpClient} from '@angular/common/http';
import {Component, Input, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {Store} from '@ngxs/store';
import {interval, Observable} from 'rxjs';
import {debounce, distinctUntilChanged, skipWhile, takeUntil, tap} from 'rxjs/operators';
import {BaseComponent} from '../../../../components/base/base.component';
import {
  SetSpokenLanguage,
  SetSpokenLanguageText,
  SuggestAlternativeText,
} from '../../../../modules/translate/translate.actions';
import {TranslateStateModel} from '../../../../modules/translate/translate.state';

@Component({
  selector: 'app-spoken-language-input',
  templateUrl: './spoken-language-input.component.html',
  styleUrls: ['./spoken-language-input.component.scss'],
})
export class SpokenLanguageInputComponent extends BaseComponent implements OnInit {
  translate$!: Observable<TranslateStateModel>;
  text$!: Observable<string>;
  normalizedText$!: Observable<string>;

  text = new FormControl();
  maxTextLength = 500;
  detectedLanguage: string;
  spokenLanguage: string;

  textSegments: string[]; // Segments de texte découpés
  currentSegmentIndex = 0; // Index du segment actuel

  @Input() isMobile = false;
  videoId!: string;

  constructor(private store: Store, private http: HttpClient, private route: ActivatedRoute) {
    super();
    this.translate$ = this.store.select<TranslateStateModel>(state => state.translate);
    this.text$ = this.store.select<string>(state => state.translate.spokenLanguageText);
    this.normalizedText$ = this.store.select<string>(state => state.translate.normalizedSpokenLanguageText);
  }

  ngOnInit() {
    this.translate$
      .pipe(
        tap(({spokenLanguage, detectedLanguage}) => {
          this.detectedLanguage = detectedLanguage;
          this.spokenLanguage = spokenLanguage ?? detectedLanguage;
        }),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe();

    this.videoId = 'o-7VQVXU-jQ';

    if (this.videoId) {
      this.getTranscript(this.videoId); // Récupère les sous-titres si `video_id` est présent
    }
    this.updateTextSegment();
    // Met à jour automatiquement le texte du formulaire toutes les 20 secondes
    interval(20000)
      .pipe(
        tap(() => this.updateTextSegment()),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe();

    // Gère les changements locaux de texte
    this.text.valueChanges
      .pipe(
        debounce(() => interval(300)),
        skipWhile(text => !text), // Ne pas exécuter sur un texte vide au démarrage
        distinctUntilChanged((a, b) => a.trim() === b.trim()),
        tap(text => this.store.dispatch(new SetSpokenLanguageText(text))),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe();

    this.text.valueChanges
      .pipe(
        debounce(() => interval(1000)),
        distinctUntilChanged((a, b) => a.trim() === b.trim()),
        tap(() => this.store.dispatch(new SuggestAlternativeText())),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe();

    // Met à jour le champ de texte avec le texte du store
    this.text$
      .pipe(
        tap(text => this.text.setValue(text, {emitEvent: false})), // Pas d'événement ici pour éviter les boucles
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe();
  }

  private splitTextIntoSegments(text: string, maxLength: number): string[] {
    const segments: string[] = [];
    for (let i = 0; i < text.length; i += maxLength) {
      segments.push(text.substring(i, i + maxLength));
    }
    return segments;
  }

  private updateTextSegment() {
    if (this.textSegments.length > 0) {
      // Définit le texte du formulaire au segment courant avec `emitEvent: true` pour déclencher les actions
      this.text.setValue(this.textSegments[this.currentSegmentIndex], {emitEvent: true});
      // Passe au prochain segment, revient au début si fin du tableau
      this.currentSegmentIndex = (this.currentSegmentIndex + 1) % this.textSegments.length;
    }
  }

  setText(text: string) {
    this.store.dispatch(new SetSpokenLanguageText(text));
  }

  setDetectedLanguage() {
    this.store.dispatch(new SetSpokenLanguage(this.detectedLanguage));
  }

  getTranscript(videoId: string) {
    return this.http.get(`http://localhost:3000/api/transcript/${videoId}`).subscribe(
      data => {
        console.log({data});
        // this.textSegments = this.splitTextIntoSegments(data)
        // this.transcript = data;
      },
      error => console.error('Error fetching transcript:', error)
    );
  }
}
