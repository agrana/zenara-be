# Netlify Functions Configuration

## Environment Variables

Configure these environment variables in your Netlify dashboard under Site Settings > Environment Variables:

### Required
- `OPENAI_API_KEY` - Your OpenAI API key

### Optional (with defaults)
- `OPENAI_MODEL` - OpenAI model to use (default: `gpt-4o-mini`)
- `LLM_PROVIDER` - LLM provider (default: `openai`)
- `LLM_TEMPERATURE` - Model temperature (default: `0.7`)
- `LLM_MAX_TOKENS` - Maximum tokens per request (default: `1000`)

## Supported Models

### OpenAI Models
- `gpt-4o-mini` (default, cost-effective)
- `gpt-4o`
- `gpt-4-turbo`
- `gpt-3.5-turbo`

## Future Provider Support

The system is designed to support multiple LLM providers through LangChain:

### Planned Providers
- **Anthropic Claude** - Add `@langchain/anthropic` package
- **Google Gemini** - Add `@langchain/google-genai` package
- **Azure OpenAI** - Configure with `@langchain/openai` and Azure endpoints
- **Local Models** - Support for Ollama, LM Studio, etc.

### Adding New Providers

1. Install the appropriate LangChain package
2. Add provider configuration in the function
3. Update environment variable documentation
4. Test with the new provider

## Example Configuration

```bash
# Basic OpenAI setup
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini

# Advanced configuration
LLM_PROVIDER=openai
LLM_TEMPERATURE=0.7
LLM_MAX_TOKENS=1000
```

## Troubleshooting

### Common Issues
1. **502 Error**: Check that all required environment variables are set
2. **Model Not Found**: Verify the model name is correct for your API key
3. **Rate Limits**: Adjust `LLM_MAX_TOKENS` or add retry logic
4. **LangChain Import Errors**: Ensure all dependencies are properly bundled
