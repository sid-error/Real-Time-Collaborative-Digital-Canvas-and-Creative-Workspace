import React from 'react';

/**
 * TermsOfServiceContent component - Displays the Terms of Service content
 * 
 * @component
 * @returns {JSX.Element} Terms of Service content with proper formatting
 */
export const TermsOfServiceContent: React.FC = () => {
    return (
        <div className="prose prose-slate max-w-none">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Terms of Service</h2>

            <p className="text-slate-600 mb-4">
                <strong>Last Updated:</strong> February 11, 2026
            </p>

            <section className="mb-6">
                <h3 className="text-xl font-semibold text-slate-800 mb-3">1. Acceptance of Terms</h3>
                <p className="text-slate-700 mb-2">
                    By accessing and using CollabCanvas ("the Service"), you accept and agree to be bound by the terms
                    and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                </p>
            </section>

            <section className="mb-6">
                <h3 className="text-xl font-semibold text-slate-800 mb-3">2. Use License</h3>
                <p className="text-slate-700 mb-2">
                    Permission is granted to temporarily access the materials (information or software) on CollabCanvas
                    for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer
                    of title, and under this license you may not:
                </p>
                <ul className="list-disc list-inside text-slate-700 ml-4 space-y-1">
                    <li>Modify or copy the materials</li>
                    <li>Use the materials for any commercial purpose or for any public display</li>
                    <li>Attempt to reverse engineer any software contained on CollabCanvas</li>
                    <li>Remove any copyright or other proprietary notations from the materials</li>
                </ul>
            </section>

            <section className="mb-6">
                <h3 className="text-xl font-semibold text-slate-800 mb-3">3. User Account</h3>
                <p className="text-slate-700 mb-2">
                    To access certain features of the Service, you must register for an account. You agree to:
                </p>
                <ul className="list-disc list-inside text-slate-700 ml-4 space-y-1">
                    <li>Provide accurate, current, and complete information during registration</li>
                    <li>Maintain and promptly update your account information</li>
                    <li>Maintain the security of your password and accept all risks of unauthorized access</li>
                    <li>Notify us immediately of any unauthorized use of your account</li>
                </ul>
            </section>

            <section className="mb-6">
                <h3 className="text-xl font-semibold text-slate-800 mb-3">4. User Content</h3>
                <p className="text-slate-700 mb-2">
                    You retain all rights to any content you submit, post, or display on or through the Service.
                    By submitting content, you grant us a worldwide, non-exclusive, royalty-free license to use,
                    copy, reproduce, process, adapt, modify, publish, transmit, display, and distribute such content.
                </p>
            </section>

            <section className="mb-6">
                <h3 className="text-xl font-semibold text-slate-800 mb-3">5. Prohibited Activities</h3>
                <p className="text-slate-700 mb-2">
                    You agree not to engage in any of the following prohibited activities:
                </p>
                <ul className="list-disc list-inside text-slate-700 ml-4 space-y-1">
                    <li>Violating laws or regulations</li>
                    <li>Infringing on intellectual property rights</li>
                    <li>Transmitting viruses or malicious code</li>
                    <li>Harassing, abusing, or harming other users</li>
                    <li>Attempting to gain unauthorized access to the Service</li>
                </ul>
            </section>

            <section className="mb-6">
                <h3 className="text-xl font-semibold text-slate-800 mb-3">6. Termination</h3>
                <p className="text-slate-700 mb-2">
                    We may terminate or suspend your account and bar access to the Service immediately, without prior
                    notice or liability, under our sole discretion, for any reason whatsoever, including without
                    limitation if you breach the Terms.
                </p>
            </section>

            <section className="mb-6">
                <h3 className="text-xl font-semibold text-slate-800 mb-3">7. Limitation of Liability</h3>
                <p className="text-slate-700 mb-2">
                    In no event shall CollabCanvas, nor its directors, employees, partners, agents, suppliers, or
                    affiliates, be liable for any indirect, incidental, special, consequential or punitive damages,
                    including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
                </p>
            </section>

            <section className="mb-6">
                <h3 className="text-xl font-semibold text-slate-800 mb-3">8. Changes to Terms</h3>
                <p className="text-slate-700 mb-2">
                    We reserve the right to modify or replace these Terms at any time. If a revision is material,
                    we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes
                    a material change will be determined at our sole discretion.
                </p>
            </section>

            <section className="mb-6">
                <h3 className="text-xl font-semibold text-slate-800 mb-3">9. Contact Information</h3>
                <p className="text-slate-700 mb-2">
                    If you have any questions about these Terms, please contact us at{' '}
                    <a href="mailto:support@collabcanvas.com" className="text-blue-600 hover:underline">
                        support@collabcanvas.com
                    </a>
                </p>
            </section>
        </div>
    );
};
