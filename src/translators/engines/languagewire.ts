import axios from 'axios'
import TranslateEngine, { TranslateOptions, TranslateResult } from './base'
import { Config } from '~/core'

export default class LanguageWireTranslate extends TranslateEngine {
  apiRoot = 'https://lwt.languagewire.com/p/api/v1'

  async translate(options: TranslateOptions) {
    const apiKey = Config.languageWireApiKey
    let apiRoot = this.apiRoot
    if (Config.languageWireApiRoot) apiRoot = Config.languageWireApiRoot.replace(/\/$/, '')

    const response = await axios.post(
      `${apiRoot}/translations/text`,
      {
        sourceText: options.text,
        reference: {
          source: 'USER',
        },
        targetLanguage: options.to,
        // If source language is specified, include it
        ...(options.from !== 'auto' && { sourceLanguage: options.from }),
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
      },
    )

    return this.transform(response, options)
  }

  transform(response: any, options: TranslateOptions): TranslateResult {
    const { text, from = 'auto', to = 'auto' } = options

    // Get the translated text from the response
    const translatedText = response.data.translation?.trim()

    // Determine the detected source language
    const detectedSource = response.data.detectedSourceLanguage?.mmtCode || from

    const r: TranslateResult = {
      text,
      to,
      from: detectedSource,
      response,
      result: translatedText ? [translatedText] : undefined,
      linkToResult: '',
    }

    return r
  }
}
