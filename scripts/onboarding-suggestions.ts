import { generateOnboardingSuggestionResponse } from '../lib/onboarding/service'

async function main() {
  const jsonMode = process.argv.includes('--json')
  const result = await generateOnboardingSuggestionResponse()
  const { documents, suggestions, warnings, provider } = result

  if (jsonMode) {
    console.log(
      JSON.stringify(
        {
          documents,
          suggestions,
          warnings,
          provider,
        },
        null,
        2
      )
    )
    return
  }

  console.log('Onboarding suggestion scan')
  console.log('==========================')
  console.log(`Documents analyzed: ${documents.length}`)

  if (documents.length > 0) {
    console.log('\nSources:')
    for (const document of documents) {
      console.log(`- ${document.path}`)
    }
  }

  if (suggestions.length > 0) {
    console.log('\nSuggestions:')
    for (const suggestion of suggestions) {
      console.log(`- ${suggestion.field}: ${suggestion.suggestedValue}`)
      console.log(`  confidence: ${suggestion.confidence}`)
      console.log(`  sources: ${suggestion.sources.join(', ') || 'n/a'}`)
      console.log(`  rationale: ${suggestion.rationale}`)
    }
  } else {
    console.log('\nNo suggestions found.')
  }

  if (warnings.length > 0) {
    console.log('\nWarnings:')
    for (const warning of warnings) {
      console.log(`- ${warning}`)
    }
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
