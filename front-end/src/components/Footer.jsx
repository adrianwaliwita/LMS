const Footer = () => {
  return (
    <footer className="w-full bg-black">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-7 border-t  ">
          <p className="text-center text-white text-lg ">
            &copy; {new Date().getFullYear()} SCMS. All rights reserved.
          </p>
          <p className="text-center text-sm text-gray-400 pt-4   ">
            All content on this website is the property of the project owner and
            is protected by relevant copyright laws. Unauthorized use,
            reproduction, or distribution is prohibited. By accessing this site,
            you agree to the Terms of Use, Privacy Policy, and Data Protection
            Agreement (DPA). The project owner is committed to ensuring the
            security of your personal data in compliance with applicable data
            protection regulations. For further details, please refer to the
            policy documents or contact us directly.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
