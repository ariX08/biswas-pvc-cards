export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl space-y-6">
      <h1 className="text-3xl font-bold">Contact</h1>
      <p className="text-muted-foreground">
        Biswas PVC Cards · Biswas Cyber Cafe, Kolkata, West Bengal
      </p>
      <div className="space-y-2 text-sm">
        <p>
          <strong>Phone:</strong>{" "}
          <a className="text-primary hover:underline" href="tel:+919123898712">
            +91 91238 98712
          </a>
        </p>
        <p>
          <strong>Email:</strong>{" "}
          <a className="text-primary hover:underline" href="mailto:biswascybercafe0615@gmail.com">
            biswascybercafe0615@gmail.com
          </a>
        </p>
      </div>
      <iframe
        src="https://maps.google.com/maps?q=Biswas%20Cyber%20Cafe%20Kolkata&t=&z=15&ie=UTF8&iwloc=&output=embed"
        title="Shop map"
        className="w-full h-64 rounded-xl border"
        loading="lazy"
      />
    </div>
  );
}
