import React from 'react';

/**
 * PrivacyPolicyContent component - Displays the Privacy Policy content
 * 
 * @component
 * @returns {JSX.Element} Privacy Policy content with proper formatting
 */
export const PrivacyPolicyContent: React.FC = () => {
    return (
        <div className="prose prose-slate max-w-none">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Privacy Policy</h2>

            <p className="text-slate-600 mb-4">
                <strong>Last Updated:</strong> February 11, 2026
            </p>

            <section className="mb-6">
                <h3 className="text-xl font-semibold text-slate-800 mb-3">1. Information We Collect</h3>
                <p className="text-slate-700 mb-2">
                    We collect information that you provide directly to us, including:
                </p>
                <ul className="list-disc list-inside text-slate-700 ml-4 space-y-1">
                    <li><strong>Account Information:</strong> Name, email address, username, and password</li>
                    <li><strong>Profile Information:</strong> Optional profile details you choose to provide</li>
                    <li><strong>Content:</strong> Projects, canvases, and collaboration data you create</li>
                    <li><strong>Communications:</strong> Messages and support requests</li>
                </ul>
            </section>

            <section className="mb-6">
                <h3 className="text-xl font-semibold text-slate-800 mb-3">2. How We Use Your Information</h3>
                <p className="text-slate-700 mb-2">
                    We use the information we collect to:
                </p>
                <ul className="list-disc list-inside text-slate-700 ml-4 space-y-1">
                    <li>Provide, maintain, and improve our services</li>
                    <li>Process your transactions and send related information</li>
                    <li>Send you technical notices, updates, and support messages</li>
                    <li>Respond to your comments and questions</li>
                    <li>Monitor and analyze trends, usage, and activities</li>
                    <li>Detect, prevent, and address technical issues and security threats</li>
                </ul>
            </section>

            <section className="mb-6">
                <h3 className="text-xl font-semibold text-slate-800 mb-3">3. Information Sharing</h3>
                <p className="text-slate-700 mb-2">
                    We do not sell, trade, or rent your personal information to third parties. We may share your
                    information only in the following circumstances:
                </p>
                <ul className="list-disc list-inside text-slate-700 ml-4 space-y-1">
                    <li><strong>With your consent:</strong> When you explicitly authorize us to share information</li>
                    <li><strong>Service providers:</strong> Third-party vendors who perform services on our behalf</li>
                    <li><strong>Legal requirements:</strong> When required by law or to protect our rights</li>
                    <li><strong>Business transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                </ul>
            </section>

            <section className="mb-6">
                <h3 className="text-xl font-semibold text-slate-800 mb-3">4. Data Security</h3>
                <p className="text-slate-700 mb-2">
                    We implement appropriate technical and organizational measures to protect your personal information
                    against unauthorized access, alteration, disclosure, or destruction. These measures include:
                </p>
                <ul className="list-disc list-inside text-slate-700 ml-4 space-y-1">
                    <li>Encryption of data in transit and at rest</li>
                    <li>Regular security assessments and updates</li>
                    <li>Access controls and authentication mechanisms</li>
                    <li>Employee training on data protection</li>
                </ul>
            </section>

            <section className="mb-6">
                <h3 className="text-xl font-semibold text-slate-800 mb-3">5. Data Retention</h3>
                <p className="text-slate-700 mb-2">
                    We retain your personal information for as long as necessary to provide our services and fulfill
                    the purposes outlined in this Privacy Policy. When you delete your account, we will delete or
                    anonymize your personal information within 30 days, unless we are required to retain it for legal purposes.
                </p>
            </section>

            <section className="mb-6">
                <h3 className="text-xl font-semibold text-slate-800 mb-3">6. Your Rights</h3>
                <p className="text-slate-700 mb-2">
                    You have the right to:
                </p>
                <ul className="list-disc list-inside text-slate-700 ml-4 space-y-1">
                    <li>Access and receive a copy of your personal information</li>
                    <li>Correct inaccurate or incomplete information</li>
                    <li>Request deletion of your personal information</li>
                    <li>Object to or restrict certain processing of your information</li>
                    <li>Export your data in a portable format</li>
                    <li>Withdraw consent where processing is based on consent</li>
                </ul>
            </section>

            <section className="mb-6">
                <h3 className="text-xl font-semibold text-slate-800 mb-3">7. Cookies and Tracking</h3>
                <p className="text-slate-700 mb-2">
                    We use cookies and similar tracking technologies to collect information about your browsing
                    activities. You can control cookies through your browser settings, but disabling cookies may
                    limit your ability to use certain features of our Service.
                </p>
            </section>

            <section className="mb-6">
                <h3 className="text-xl font-semibold text-slate-800 mb-3">8. Children's Privacy</h3>
                <p className="text-slate-700 mb-2">
                    Our Service is not intended for children under 13 years of age. We do not knowingly collect
                    personal information from children under 13. If you are a parent or guardian and believe your
                    child has provided us with personal information, please contact us.
                </p>
            </section>

            <section className="mb-6">
                <h3 className="text-xl font-semibold text-slate-800 mb-3">9. Changes to This Policy</h3>
                <p className="text-slate-700 mb-2">
                    We may update this Privacy Policy from time to time. We will notify you of any changes by
                    posting the new Privacy Policy on this page and updating the "Last Updated" date. We encourage
                    you to review this Privacy Policy periodically.
                </p>
            </section>

            <section className="mb-6">
                <h3 className="text-xl font-semibold text-slate-800 mb-3">10. Contact Us</h3>
                <p className="text-slate-700 mb-2">
                    If you have any questions about this Privacy Policy, please contact us at{' '}
                    <a href="mailto:privacy@collabcanvas.com" className="text-blue-600 hover:underline">
                        privacy@collabcanvas.com
                    </a>
                </p>
            </section>
        </div>
    );
};
