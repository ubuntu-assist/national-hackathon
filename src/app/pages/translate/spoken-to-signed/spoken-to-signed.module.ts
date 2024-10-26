import {NgModule} from '@angular/core';

import {CommonModule} from '@angular/common';
import {HttpClientModule} from '@angular/common/http';
import {ReactiveFormsModule} from '@angular/forms';
import {MatTooltipModule} from '@angular/material/tooltip';
import {IonicModule} from '@ionic/angular';
import {SpeechToTextModule} from '../../../components/speech-to-text/speech-to-text.module';
import {TextToSpeechModule} from '../../../components/text-to-speech/text-to-speech.module';
import {AppTranslocoModule} from '../../../core/modules/transloco/transloco.module';
import {KeyboardFlyingDirective} from '../../../directives/keyboard-flying.directive';
import {PoseViewersModule} from '../pose-viewers/pose-viewers.module';
import {SignWritingModule} from '../signwriting/signwriting.module';
import {SignedLanguageOutputComponent} from './signed-language-output/signed-language-output.component';
import {DesktopTextareaComponent} from './spoken-language-input/desktop-textarea/desktop-textarea.component';
import {SpokenLanguageInputComponent} from './spoken-language-input/spoken-language-input.component';
import {SpokenToSignedComponent} from './spoken-to-signed.component';

const componentModules = [SpeechToTextModule, TextToSpeechModule, SignWritingModule, PoseViewersModule];
const components = [
  SpokenToSignedComponent,
  DesktopTextareaComponent,
  SpokenLanguageInputComponent,
  SignedLanguageOutputComponent,
  KeyboardFlyingDirective,
];

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AppTranslocoModule,
    MatTooltipModule,
    IonicModule,
    HttpClientModule,
    ...componentModules,
  ],
  declarations: components,
  exports: components,
})
export class SpokenToSignedModule {}
