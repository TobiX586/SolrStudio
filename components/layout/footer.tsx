export function Footer() {
  return (
    <footer className="border-t py-4 px-6">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
        <p className="text-sm text-muted-foreground">
          Built with ❤️ by the Solr Studio team
        </p>
        <div className="flex items-center space-x-4">
          <a
            href="https://solr.apache.org/guide/solr/latest/getting-started/solr-tutorial.html"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:underline"
          >
            Documentation
          </a>
          <a
            href="https://github.com/apache/solr"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:underline"
          >
            GitHub
          </a>
          <a
            href="https://solr.apache.org/community.html"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:underline"
          >
            Community
          </a>
        </div>
      </div>
    </footer>
  )
}