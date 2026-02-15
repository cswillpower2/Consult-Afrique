import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import type { NewsArticle } from "@shared/schema";

function getArticleImages(article: NewsArticle): string[] {
  const images = article.images?.filter(Boolean) || [];
  if (images.length > 0) return images;
  if (article.imageUrl) return [article.imageUrl];
  return [];
}

function ImageSlideshow({ images, title }: { images: string[]; title: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (images.length === 0) return null;

  const goNext = () => setCurrentIndex((prev) => (prev + 1) % images.length);
  const goPrev = () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <div className="relative w-full overflow-hidden rounded-md" data-testid="news-slideshow">
      <div className="relative aspect-video">
        <img
          src={images[currentIndex]}
          alt={`${title} - ${currentIndex + 1}`}
          className="w-full h-full object-cover"
          data-testid={`img-slideshow-${currentIndex}`}
        />
      </div>
      {images.length > 1 && (
        <>
          <Button
            size="icon"
            variant="secondary"
            className="absolute left-2 top-1/2 -translate-y-1/2 opacity-80"
            onClick={goPrev}
            data-testid="button-slideshow-prev"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="absolute right-2 top-1/2 -translate-y-1/2 opacity-80"
            onClick={goNext}
            data-testid="button-slideshow-next"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === currentIndex ? "bg-white" : "bg-white/50"
                }`}
                data-testid={`button-slideshow-dot-${i}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function NewsSection() {
  const { data: articles, isLoading } = useQuery<NewsArticle[]>({
    queryKey: ["/api/news"],
  });
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);

  if (isLoading) {
    return (
      <section id="news" className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-foreground mb-4">
              News & Updates
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Stay informed with the latest from ConsultAfrique
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <Skeleton className="h-48 w-full rounded-t-md" />
                <CardContent className="p-5 space-y-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-12 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!articles || articles.length === 0) {
    return null;
  }

  const displayedArticles = articles.slice(0, 6);

  return (
    <section id="news" className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Latest News
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-foreground mb-4">
            News & Updates
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Stay informed with the latest from ConsultAfrique
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedArticles.map((article) => {
            const images = getArticleImages(article);
            return (
              <button
                key={article.id}
                onClick={() => setSelectedArticle(article)}
                className="group text-left bg-card rounded-xl border border-card-border hover-elevate transition-all duration-300 overflow-hidden"
                data-testid={`card-news-${article.id}`}
              >
                {images.length > 0 && (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={images[0]}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      data-testid={`img-news-${article.id}`}
                    />
                    {images.length > 1 && (
                      <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md">
                        +{images.length - 1} more
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                      <span className="text-white text-sm font-medium">Read More</span>
                    </div>
                  </div>
                )}
                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <time>
                      {article.publishedAt
                        ? new Date(article.publishedAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "Recently"}
                    </time>
                  </div>
                  <h3 className="font-semibold text-lg text-foreground leading-tight" data-testid={`text-news-title-${article.id}`}>
                    {article.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                    {article.summary}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <Dialog open={!!selectedArticle} onOpenChange={() => setSelectedArticle(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-news-detail">
          {selectedArticle && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <Calendar className="w-3 h-3" />
                  <time>
                    {selectedArticle.publishedAt
                      ? new Date(selectedArticle.publishedAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "Recently"}
                  </time>
                </div>
                <DialogTitle className="text-2xl font-serif" data-testid="text-news-detail-title">
                  {selectedArticle.title}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                <ImageSlideshow
                  images={getArticleImages(selectedArticle)}
                  title={selectedArticle.title}
                />

                <div>
                  <p className="text-muted-foreground font-medium mb-4 italic">
                    {selectedArticle.summary}
                  </p>
                  <div className="text-foreground leading-relaxed whitespace-pre-line" data-testid="text-news-detail-content">
                    {selectedArticle.content}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
