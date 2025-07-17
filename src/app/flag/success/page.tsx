'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

export default function FlagSuccessPage() {
  return (
    <div className="min-h-screen bg-[#FAF7F3]">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-[#FAF7F3] border-[#8E8B82] text-center">
            <CardHeader>
              <CardTitle className="text-[#4E3629] text-2xl">
                Report Submitted
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-[#8E8B82]">
                <p className="text-lg mb-4">
                  Thanks! Our moderators will review this definition soon.
                </p>
                <p className="text-sm">
                  We appreciate your help in keeping Bruno's Dictionary accurate and appropriate.
                </p>
              </div>
              
              <div className="flex justify-center space-x-4">
                <Link href="/">
                  <Button className="bg-[#B04A39] hover:bg-[#B04A39]/90 text-white">
                    Return Home
                  </Button>
                </Link>
                <Link href="/search">
                  <Button variant="outline" className="border-[#8E8B82] text-[#8E8B82]">
                    Continue Searching
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  )
} 