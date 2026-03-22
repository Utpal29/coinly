import { Coffee, Mail, HelpCircle } from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

const faqs = [
  {
    question: 'How do I add a transaction?',
    answer: 'Navigate to the Dashboard and click the "Add Transaction" button, or use the + icon in the navigation bar. Fill in the amount, category, description, and date, then submit.',
  },
  {
    question: 'Can I change my currency?',
    answer: 'Yes! Go to your Profile page, switch to the Preferences tab, and select your preferred currency from the dropdown. All amounts will be displayed in your chosen currency.',
  },
  {
    question: 'How do I export my data?',
    answer: 'Go to your Profile page, switch to the Preferences tab, and click the "Export Transactions" button. Your data will be downloaded as a CSV file.',
  },
  {
    question: 'Is my financial data secure?',
    answer: 'Yes. Your data is stored securely in Supabase with row-level security enabled. Only you can access your transactions and financial information.',
  },
  {
    question: 'Can I delete my account?',
    answer: 'Yes. Go to your Profile page, switch to the Security tab, and click "Delete Account". This will permanently remove all your data.',
  },
]

export default function Support() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4 sm:p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Support Header */}
        <GlassCard className="text-center">
          <Coffee className="mx-auto mb-4 h-12 w-12 text-primary" />
          <h1 className="mb-2 text-2xl font-semibold text-white sm:text-3xl">Support Coinly</h1>
          <p className="mb-6 text-muted-foreground">
            If you find Coinly helpful, consider buying me a coffee to support the development!
          </p>
          <Button asChild className="bg-[#FFDD00] text-black hover:bg-[#FFDD00]/90">
            <a href="https://buymeacoffee.com/utpal29" target="_blank" rel="noopener noreferrer">
              <Coffee className="mr-2 h-4 w-4" />
              Buy Me a Coffee
            </a>
          </Button>
        </GlassCard>

        {/* FAQ */}
        <GlassCard>
          <div className="mb-4 flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-white">Frequently Asked Questions</h2>
          </div>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-left text-white">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </GlassCard>

        {/* Contact */}
        <GlassCard>
          <div className="mb-4 flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-white">Get in Touch</h2>
          </div>
          <p className="text-muted-foreground">
            Have a question or feedback? Visit the{' '}
            <a
              href="https://utpal.netlify.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              creator's website
            </a>{' '}
            to get in touch.
          </p>
        </GlassCard>
      </div>
    </div>
  )
}
