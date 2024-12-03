import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="py-6 px-4 md:px-6 lg:px-8 border-t">
      <div className="container mx-auto text-center">
        <p className="text-muted-foreground">
          Built with ❤️ by{' '}
          <Link href="https://x.com/jintoppy" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
            Jinto
          </Link>
          {' '}for #Buildathon
        </p>
      </div>
    </footer>
  )
}

