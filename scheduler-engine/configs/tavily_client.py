from tavily import TavilyClient
import os
import trafilatura

class TavilyClientHolder:
    tavily_client: TavilyClient
    failed_urls = set()

    def __init__(self):
        self.tavily_client = TavilyClient(api_key=os.environ.get('TAVILY_API_KEY'))
        
    def query(self, query, topic='news'):
        return self.tavily_client.search(query, include_answer='basic', topic=topic, max_results=10)
    
    def find_the_latest_news_in_politics(self):
        return self.tavily_client.search(query='What is new in politics', max_results=10)
    
    def extract_article_content(self, url):
        if url in self.failed_urls:
            return "Could not extract content from article. The website may not allow extraction. Try a different article URL."
        
        content =  trafilatura.extract(trafilatura.fetch_url(url))
        
        if (not content or content == ''):
            self.failed_urls.add(url)
            return "Could not extract content from article. The website may not allow extraction. Try a different article URL."
        return content
    

class TavilyClientSingleton:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = TavilyClientHolder()
        return cls._instance


def get_tavily_client() -> TavilyClientHolder:
    return TavilyClientSingleton()
