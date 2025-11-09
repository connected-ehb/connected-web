import {ApplicationConfig, importProvidersFrom, provideZoneChangeDetection} from '@angular/core';
import {provideRouter} from '@angular/router';
import Aura from '@primeuix/themes/aura';

import {routes} from './app.routes';
import {provideClientHydration, withEventReplay} from '@angular/platform-browser';
import {provideHttpClient, withFetch, withInterceptors} from '@angular/common/http';

import {provideStore} from '@ngrx/store';
import {provideEffects} from '@ngrx/effects';
import {authReducer} from './auth/store/auth.reducer';
import {AuthEffects} from './auth/store/auth.effects';
import {authInterceptor} from './auth/interceptor/auth.interceptor';
import {csrfInterceptor} from './auth/interceptor/csrf.interceptor';
import {FormsModule} from '@angular/forms';
import {LayoutModule} from '@angular/cdk/layout';
import {NgxEditorModule} from 'ngx-editor';
import {provideCharts, withDefaultRegisterables} from 'ng2-charts';
import {providePrimeNG} from 'primeng/config';

export const appConfig: ApplicationConfig = {
    providers: [
        provideZoneChangeDetection({eventCoalescing: true}),
        provideRouter(routes),
        provideClientHydration(withEventReplay()),
        provideHttpClient(withFetch(), withInterceptors([csrfInterceptor, authInterceptor])),
        provideStore({auth: authReducer}),
        provideEffects([AuthEffects]),
        importProvidersFrom(
            FormsModule,
            LayoutModule,
            NgxEditorModule.forRoot({
                locals: {
                    bold: 'Bold',
                    italic: 'Italic',
                    code: 'Code',
                    blockquote: 'Blockquote',
                    underline: 'Underline',
                    strike: 'Strike',
                    bullet_list: 'Bullet List',
                    ordered_list: 'Ordered List',
                    heading: 'Heading',
                    h1: 'Header 1',
                    h2: 'Header 2',
                    h3: 'Header 3',
                    h4: 'Header 4',
                    h5: 'Header 5',
                    h6: 'Header 6',
                    align_left: 'Left Align',
                    align_center: 'Center Align',
                    align_right: 'Right Align',
                    align_justify: 'Justify',
                    text_color: 'Text Color',
                    background_color: 'Background Color',
                    url: 'URL',
                    text: 'Text',
                    openInNewTab: 'Open in new tab',
                    insert: 'Insert',
                    altText: 'Alt Text',
                    title: 'Title',
                    remove: 'Remove',
                    enterValidUrl: 'Please enter a valid URL',
                },
            })
        ),
        provideCharts(withDefaultRegisterables()),
        providePrimeNG({
            theme: {
                preset: Aura
            }
        })
    ]
};
