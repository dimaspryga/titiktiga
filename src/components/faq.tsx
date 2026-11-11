"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useI18n } from "@/lib/i18n";
import type { FaqItem } from "@/lib/types";

export function FaqList({ items }: { items: FaqItem[] }) {
  const { tt } = useI18n();
  return (
    <Accordion type="single" collapsible className="w-full" data-testid="faq-list">
      {items.map((item) => (
        <AccordionItem key={item.id} value={item.id} data-testid={`faq-item-${item.id}`}>
          <AccordionTrigger
            data-testid={`faq-trigger-${item.id}`}
            className="text-left font-display text-xl font-medium hover:no-underline md:text-2xl"
          >
            {tt(item.question)}
          </AccordionTrigger>
          <AccordionContent
            data-testid={`faq-content-${item.id}`}
            className="text-base leading-relaxed text-muted-foreground md:text-lg"
          >
            {tt(item.answer)}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
