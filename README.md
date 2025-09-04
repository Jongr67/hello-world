# Agentic AI Application

A sophisticated Spring Boot-based AI application that simulates intelligent information retrieval, evaluation, and response generation similar to Cursor. The application can query databases, APIs, and knowledge bases, then evaluate the accuracy of retrieved information before providing comprehensive responses to users.

## 🚀 Current Status: MVP Complete & Running!

**✅ Application Status**: Successfully compiled, running, and responding to API requests  
**✅ Core Architecture**: Complete Spring Boot application with full service layer  
**✅ API Endpoints**: All REST endpoints tested and working  
**✅ Database**: H2 in-memory database operational with JPA + MongoDB support  
**⚠️ AI Integration**: Currently using placeholder services (no real AI models yet)

## Features

### 🤖 Intelligent Query Processing
- **Multi-source Information Retrieval**: Searches across databases, APIs, knowledge bases, and document stores
- **Semantic Search**: Advanced search capabilities using vector similarity and natural language processing
- **Query Classification**: Automatically categorizes queries by type (database, API, document, general, technical, business)

### 🔍 Information Evaluation & Verification
- **Accuracy Assessment**: AI-powered evaluation of retrieved information
- **Bias Detection**: Identifies potential biases and misinformation
- **Consistency Checking**: Cross-references information across multiple sources
- **Confidence Scoring**: Provides confidence ratings for all responses

### 📊 Comprehensive Response Generation
- **Synthesized Responses**: Combines information from multiple sources into coherent answers
- **Source Attribution**: Includes references and confidence indicators
- **Recommendations**: Generates follow-up suggestions and related topics
- **Format Adaptation**: Tailors responses based on query type and user preferences

### 🗄️ Flexible Data Storage
- **Hybrid Database Support**: JPA for structured data, MongoDB for knowledge base
- **Scalable Architecture**: Designed for high-performance information retrieval
- **Query History**: Maintains comprehensive logs of all interactions

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   REST API      │    │   AI Agent       │    │  Information    │
│   Controller    │◄──►│   Service        │◄──►│  Retrieval      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │                       │
                                ▼                       ▼
                       ┌──────────────────┐    ┌─────────────────┐
                       │   AI Evaluation  │    │  Knowledge      │
                       │   Service        │    │  Base           │
                       └──────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │  Response        │
                       │  Generation      │
                       └──────────────────┘
```

## Technology Stack

- **Framework**: Spring Boot 3.2.0
- **Java Version**: 17 (runtime: 21.0.8)
- **Database**: H2 (in-memory), MongoDB support
- **Build Tool**: Maven
- **AI Integration**: **Placeholder services** (ready for OpenAI/Gemini integration)

## 🎯 Next Steps: Real AI Integration

### Phase 1: OpenAI Integration (Immediate Priority)

#### 1.1 Add OpenAI Dependencies
```xml
<!-- Add to pom.xml -->
<dependency>
    <groupId>com.theokanning.openai-gpt3-java</groupId>
    <artifactId>service</artifactId>
    <version>0.18.2</version>
</dependency>
```

#### 1.2 Configure OpenAI API
```properties
# application.properties
openai.api.key=your-openai-api-key-here
openai.model=gpt-4
openai.max-tokens=2000
```

#### 1.3 Replace Placeholder Services

**Current Status**: All services are placeholder implementations
**Target**: Real AI-powered services using OpenAI

| Service | Current | Target |
|---------|---------|---------|
| `AiEvaluationService` | Hardcoded scores (0.8, 0.7) | GPT-4 powered evaluation |
| `ResponseGenerationService` | Static text responses | Dynamic AI-generated responses |
| `InformationRetrievalService` | Mock data | Real database/API queries |

#### 1.4 Implementation Example
```java
@Service
public class AiEvaluationServiceImpl implements AiEvaluationService {
    
    @Value("${openai.api.key}")
    private String openaiApiKey;
    
    private OpenAiService openAiService;
    
    @PostConstruct
    public void init() {
        this.openAiService = new OpenAiService(openaiApiKey);
    }
    
    @Override
    public QueryResult evaluateResult(QueryResult result) {
        // Real OpenAI call instead of placeholder
        ChatCompletionRequest request = ChatCompletionRequest.builder()
            .model("gpt-4")
            .messages(Arrays.asList(
                new ChatMessage("system", "You are an AI evaluator. Analyze the content for accuracy, relevance, and potential bias."),
                new ChatMessage("user", "Evaluate this content: " + result.getContent())
            ))
            .build();
        
        ChatCompletionResponse response = openAiService.createChatCompletion(request);
        // Process real AI response and update result
        return processAiEvaluation(result, response);
    }
}
```

### Phase 2: Enhanced Information Retrieval

#### 2.1 Database Integration
- Implement real database search using JPA
- Add PostgreSQL support for production
- Create custom search repositories

#### 2.2 External API Connectors
- Weather API integration
- News API integration
- Wikipedia API integration
- Custom API connector framework

#### 2.3 Knowledge Base Population
- MongoDB document ingestion
- Vector embeddings for semantic search
- Document preprocessing pipeline

### Phase 3: Advanced AI Features

#### 3.1 Multi-Model Support
- OpenAI GPT-4 for evaluation
- Google Gemini for response generation
- Claude for bias detection
- Model fallback and routing

#### 3.2 Real-time Processing
- Streaming responses
- Async processing with WebFlux
- Real-time evaluation updates

#### 3.3 Advanced Analytics
- Query performance metrics
- AI model performance tracking
- User satisfaction analytics

## Getting Started

### Prerequisites

- Java 17 or higher
- Maven 3.6+
- MongoDB (optional, for knowledge base features)
- **OpenAI API key** (for real AI integration)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd agentic-ai-app
   ```

2. **Configure environment variables**
   ```bash
   export OPENAI_API_KEY="your-openai-api-key"
   ```

3. **Build the project**
   ```bash
   mvn clean install
   ```

4. **Run the application**
   ```bash
   mvn spring-boot:run
   ```

The application will start on `http://localhost:8080`

### Current Configuration

The application currently uses:
- **Database**: H2 in-memory database
- **AI Services**: **Placeholder implementations** (no real AI calls)
- **Logging**: SLF4J with Logback
- **Performance**: Basic async processing with CompletableFuture

## API Endpoints

### Core AI Agent Endpoints

| Method | Endpoint | Description | Status |
|--------|----------|-------------|---------|
| `POST` | `/api/v1/ai-agent/query` | Process a new AI query | ✅ Working |
| `GET` | `/api/v1/ai-agent/query/{id}/status` | Get query processing status | ✅ Working |
| `GET` | `/api/v1/ai-agent/query/{id}` | Get query details | ✅ Working |
| `POST` | `/api/v1/ai-agent/query/{id}/evaluate` | Evaluate query results | ✅ Working |
| `POST` | `/api/v1/ai-agent/query/{id}/feedback` | Provide feedback on response | ✅ Working |

### Utility Endpoints

| Method | Endpoint | Description | Status |
|--------|----------|-------------|---------|
| `GET` | `/api/v1/ai-agent/health` | Health check | ✅ Working |
| `GET` | `/api/v1/ai-agent/stats` | System statistics | ✅ Working |
| `GET` | `/api/v1/ai-agent/user/{id}/history` | User query history | ✅ Working |

### Example Usage

#### Process a Query (Currently Working)
```bash
curl -X POST http://localhost:8080/api/v1/ai-agent/query \
  -H "Content-Type: application/json" \
  -d '{
    "queryText": "What are the latest developments in AI?",
    "queryType": "GENERAL",
    "enableEvaluation": true
  }'
```

**Current Response**: Placeholder text with mock data  
**Target Response**: Real AI-generated content with actual information

## Data Models

### Query
- **ID**: Unique identifier ✅
- **Query Text**: User's question ✅
- **Type**: Classification ✅
- **Status**: Processing state ✅
- **Context**: Additional context information ✅
- **Confidence Score**: Overall confidence rating ✅

### QueryResult
- **Source**: Information source ✅
- **Content**: Retrieved information ✅
- **Relevance Score**: How relevant the result is to the query ✅
- **Accuracy Score**: AI-evaluated accuracy ✅
- **Confidence Score**: Confidence in the result ✅
- **Verification Status**: Whether the information has been verified ✅

### KnowledgeBase
- **Title & Content**: Knowledge entry information ✅
- **Category & Tags**: Classification and searchability ✅
- **Source**: Origin of the information ✅
- **Confidence Score**: Reliability rating ✅
- **Verification Status**: Fact-checking status ✅

## 🧪 Testing Status

### ✅ What's Working
- Application startup and compilation
- All REST API endpoints
- Database operations (H2 + MongoDB)
- Service layer orchestration
- Query processing pipeline
- Response generation (placeholder)

### ⚠️ What's Placeholder
- AI evaluation (hardcoded scores)
- Response generation (static text)
- Information retrieval (mock data)
- Bias detection (simple keyword matching)

### 🚫 What's Not Implemented
- Real AI model calls
- External API integrations
- Vector similarity search
- Advanced caching
- Authentication/authorization

## Extending the Application

### Adding Real AI Models

1. **Add OpenAI dependency** to `pom.xml`
2. **Configure API key** in `application.properties`
3. **Replace placeholder services** with real AI implementations
4. **Add error handling** for API rate limits and failures
5. **Implement model fallbacks** for reliability

### Adding New Information Sources

1. Implement the `InformationRetrievalService` interface
2. Add new source types to `QueryResult.ResultSource`
3. Configure the new service in the AI agent
4. Add proper error handling and retry logic

### Custom AI Models

1. Integrate with Spring AI framework
2. Configure new models in `application.yml`
3. Update the evaluation service to use new models
4. Add model performance monitoring

## Monitoring & Observability

- **Health Checks**: ✅ Built-in health endpoints working
- **Metrics**: 📋 Prometheus metrics (planned)
- **Logging**: ✅ Structured logging with configurable levels
- **Actuator**: 📋 Spring Boot Actuator for monitoring (planned)

## Performance Considerations

- **Async Processing**: ✅ Non-blocking information retrieval
- **Connection Pooling**: 📋 Configurable HTTP client pools (planned)
- **Caching**: 📋 Redis integration (planned)
- **Load Balancing**: 📋 Horizontal scaling support (planned)

## Security Features

- **Input Validation**: ✅ Comprehensive request validation
- **Rate Limiting**: 📋 API rate limiting (planned)
- **Authentication**: 📋 JWT-based authentication (planned)
- **Authorization**: 📋 Role-based access control (planned)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Roadmap

### Phase 1 (Current) ✅ COMPLETE
- ✅ Core AI agent service
- ✅ Basic information retrieval (placeholder)
- ✅ Query processing pipeline
- ✅ REST API endpoints
- ✅ Database integration
- ✅ Service layer architecture

### Phase 2 (Next - 1-2 weeks) 🔄 IN PROGRESS
- 🔄 **Real OpenAI integration** (priority #1)
- 🔄 **Replace placeholder services** with AI models
- 🔄 **External API connectors** (weather, news, etc.)
- 🔄 **Real database search** implementation
- 🔄 **Enhanced error handling** and monitoring

### Phase 3 (Next 2-4 weeks) 📋 PLANNED
- 📋 **Multi-model support** (OpenAI + Gemini + Claude)
- 📋 **Vector similarity search** with embeddings
- 📋 **Real-time streaming** responses
- 📋 **Advanced caching** with Redis
- 📋 **Performance optimization**

### Phase 4 (Future) 🚀 VISION
- 🚀 **Multi-modal support** (images, audio)
- 🚀 **Advanced analytics dashboard**
- 🚀 **Machine learning model training**
- 🚀 **Enterprise features** and scaling
- 🚀 **Mobile app** and web UI

## 🚨 Critical Next Steps

### Immediate (This Week)
1. **Get OpenAI API key** and add to configuration
2. **Add OpenAI dependency** to `pom.xml`
3. **Replace one service** (start with `AiEvaluationService`)
4. **Test real AI integration** with simple queries

### Short Term (Next 2 Weeks)
1. **Complete OpenAI integration** for all services
2. **Add real database search** capabilities
3. **Implement external API connectors**
4. **Add comprehensive error handling**

### Medium Term (Next Month)
1. **Performance optimization** and caching
2. **Advanced AI features** (multi-model, streaming)
3. **User authentication** and authorization
4. **Production deployment** preparation

## Support

For questions and support:
- Create an issue in the repository
- Check the documentation
- Review the code examples

---

**🎯 Current Focus**: Replace placeholder services with real OpenAI integration  
**📊 Status**: MVP complete, ready for AI model integration  
**⏱️ Timeline**: Real AI functionality in 1-2 weeks with focused effort  

**Note**: This is a proof-of-concept application with a solid foundation. The placeholder services are intentionally simple to demonstrate the architecture. Real AI integration will transform this into a powerful, intelligent application.
