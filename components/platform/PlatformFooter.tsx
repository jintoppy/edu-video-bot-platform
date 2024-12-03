const Footer = () => {
    return (
      <footer className="bg-[#212529] text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">EduBot</h3>
              <p className="text-gray-400">Transforming education consultancy with AI-powered solutions.</p>
            </div>
            
            {footerLinks.map((section, index) => (
              <div key={index}>
                <h4 className="text-lg font-bold mb-4">{section.title}</h4>
                <ul className="space-y-2">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a href={link.href} className="text-gray-400 hover:text-white transition-colors">
                        {link.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} EduBot. All rights reserved.</p>
          </div>
        </div>
      </footer>
    );
  };
  
  const footerLinks = [
    {
      title: "Product",
      links: [
        { text: "Features", href: "#features" },
        { text: "Pricing", href: "#pricing" },
        { text: "Case Studies", href: "#case-studies" },
      ],
    },
    {
      title: "Company",
      links: [
        { text: "About", href: "#about" },
        { text: "Blog", href: "#blog" },
        { text: "Careers", href: "#careers" },
      ],
    },
    {
      title: "Support",
      links: [
        { text: "Documentation", href: "#docs" },
        { text: "Contact", href: "#contact" },
        { text: "Privacy Policy", href: "#privacy" },
      ],
    },
  ];
  
  export default Footer;