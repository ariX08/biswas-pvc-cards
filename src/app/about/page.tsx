export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">About Us</h1>
      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-4 text-muted-foreground">
        <p>
          Welcome to PVC Cards — your trusted partner for high-quality PVC card
          printing across India.
        </p>
        <p>
          We specialize in printing identity cards, health cards, government
          cards, and more on durable, professional-grade PVC material. Whether
          you need a single card or bulk orders, we deliver with speed and
          precision.
        </p>
        <h2 className="text-xl font-semibold text-foreground mt-8">Why Choose Us?</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>No minimum order quantity — order even 1 card</li>
          <li>Premium quality PVC material</li>
          <li>Secure document handling</li>
          <li>Transparent order tracking</li>
          <li>Competitive pricing</li>
          <li>Fast turnaround times</li>
        </ul>
        <h2 className="text-xl font-semibold text-foreground mt-8">Our Process</h2>
        <p>
          Simply browse our catalogue, select your cards, upload the required
          documents, pay via UPI, and place your order. We verify the payment,
          process your cards, and keep you updated every step of the way through
          our tracking system.
        </p>
      </div>
    </div>
  );
}
