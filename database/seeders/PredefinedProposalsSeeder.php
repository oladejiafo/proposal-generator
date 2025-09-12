<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PredefinedProposalsSeeder extends Seeder
{
    public function run(): void
    {
        //Standard/Generic Proposal Template
        $predefinedContents = [

            // Products & Supplies
            [
                'title' => 'Wholesale Supplies Proposal',
                'content' => "Dear {{client_name}},\n\nWe propose a supply agreement for your business to ensure timely delivery of quality products.\n\n**Details:**\n- Bulk pricing and discounts\n- Monthly delivery schedule\n- Quality assurance included\n\n**Contract Term:** 12 months\n**Estimated Cost:** \$20,000\n\nWe look forward to a successful partnership.\n\n**Best regards,**\n[Your Name]\n[Your Position]\n[Your Contact Information]",
                'category' => 'Standard/Generic Proposal Template'
            ],
            [
                'title' => 'Retail Products Proposal',
                'content' => "Dear {{client_name}},\n\nOur retail product offerings include a wide range of high-quality items to stock your store.\n\n**Offer Includes:**\n- Detailed catalog with pricing\n- Seasonal promotions\n- Fast shipping options\n\n**Estimated Monthly Order:** \$5,000\n\nWe are excited to supply your retail business.\n\n**Best regards,**\n[Your Name]\n[Your Position]\n[Your Contact Information]",
                'category' => 'Standard/Generic Proposal Template'
            ],

            [
                'title' => 'Event Planning Proposal',
                'content' => "Dear {{client_name}},\n\nOur team can manage your upcoming event including venue selection, logistics, and on-site coordination.\n\n**Services Include:**\n- Event theme & planning\n- Vendor management\n- On-site supervision\n\n**Cost Estimate:** \$8,000\n\nWe are excited to make your event a success.\n\n**Best regards,**\n[Your Name]\n[Your Position]\n[Your Contact Information]",
                'category' => 'Standard/Generic Proposal Template'
            ],
            [
                'title' => 'Catering Proposal',
                'content' => "Dear {{client_name}},\n\nWe provide catering services for your event with a customizable menu to delight your guests.\n\n**Offer Includes:**\n- Buffet or plated service\n- Beverage package\n- Professional staff\n\n**Cost Estimate:** \$5,000\n\nWe look forward to catering your special event.\n\n**Best regards,**\n[Your Name]\n[Your Position]\n[Your Contact Information]",
                'category' => 'Standard/Generic Proposal Template'
            ],
        ];        
        // $predefinedContents = [
        //     // Tech & Web
        //     [
        //         'title' => 'Web Design Proposal',
        //         'content' => "Dear {{client_name}},\n\nWe propose a complete website redesign for your company to improve user experience, increase conversions, and modernize your online presence.\n\n**Scope of Work:**\n- Responsive design for all devices\n- SEO-friendly structure\n- Integration with your existing CMS\n- Up to 10 pages of content\n\n**Timeline:** 4-6 weeks\n**Cost:** \$3,500\n\nWe look forward to collaborating with you.\n\n**Best regards,**\n[Your Name]\n[Your Position]\n[Your Contact Information]",
        //         'category' => 'Tech & Web'
        //     ],
        //     [
        //         'title' => 'App Development Proposal',
        //         'content' => "Dear {{client_name}},\n\nWe are excited to propose developing a mobile application for your company to enhance customer engagement and streamline business operations.\n\n**Features:**\n- iOS & Android compatibility\n- Push notifications\n- User login & profile management\n- Payment gateway integration\n- Analytics dashboard\n\n**Timeline:** 8-12 weeks\n**Cost:** \$10,000\n\nLooking forward to your feedback.\n\n**Best regards,**\n[Your Name]\n[Your Position]\n[Your Contact Information]",
        //         'category' => 'Tech & Web'
        //     ],
        //     [
        //         'title' => 'IT Services Proposal',
        //         'content' => "Dear {{client_name}},\n\nOur IT support package includes ongoing monitoring, troubleshooting, and maintenance for your company's technology infrastructure.\n\n**Services Include:**\n- 24/7 system monitoring\n- Cloud backup & recovery\n- Security updates and antivirus\n- On-site support as needed\n\n**Monthly Fee:** \$1,200\n\nWe would be pleased to ensure your systems run smoothly.\n\n**Best regards,**\n[Your Name]\n[Your Position]\n[Your Contact Information]",
        //         'category' => 'Tech & Web'
        //     ],
        
        //     // Professional Services
        //     [
        //         'title' => 'Consulting Proposal',
        //         'content' => "Dear {{client_name}},\n\nWe propose a consulting engagement aimed at optimizing your business processes and increasing efficiency.\n\n**Deliverables:**\n- Business process analysis\n- Strategic recommendations\n- Implementation support\n- Training sessions\n\n**Timeline:** 6 weeks\n**Cost:** \$5,000\n\nWe are excited to help your company achieve its goals.\n\n**Best regards,**\n[Your Name]\n[Your Position]\n[Your Contact Information]",
        //         'category' => 'Professional Services'
        //     ],
        //     [
        //         'title' => 'Marketing Proposal',
        //         'content' => "Dear {{client_name}},\n\nOur marketing strategy for your company focuses on increasing brand visibility and customer acquisition.\n\n**Plan Includes:**\n- Social media campaign setup\n- Email marketing automation\n- Paid ads management\n- Monthly performance reports\n\n**Timeline:** 3 months\n**Cost:** \$4,500\n\nWe look forward to driving results for your brand.\n\n**Best regards,**\n[Your Name]\n[Your Position]\n[Your Contact Information]",
        //         'category' => 'Professional Services'
        //     ],
        //     [
        //         'title' => 'HR Services Proposal',
        //         'content' => "Dear {{client_name}},\n\nWe offer comprehensive HR solutions to streamline your workforce management and compliance.\n\n**Services Include:**\n- Recruitment & onboarding\n- Payroll & benefits management\n- Employee handbook & policy creation\n- Performance management support\n\n**Monthly Fee:** \$2,000\n\nWe look forward to supporting your HR needs.\n\n**Best regards,**\n[Your Name]\n[Your Position]\n[Your Contact Information]",
        //         'category' => 'Professional Services'
        //     ],
        
        //     // Products & Supplies
        //     [
        //         'title' => 'Wholesale Supplies Proposal',
        //         'content' => "Dear {{client_name}},\n\nWe propose a supply agreement for your business to ensure timely delivery of quality products.\n\n**Details:**\n- Bulk pricing and discounts\n- Monthly delivery schedule\n- Quality assurance included\n\n**Contract Term:** 12 months\n**Estimated Cost:** \$20,000\n\nWe look forward to a successful partnership.\n\n**Best regards,**\n[Your Name]\n[Your Position]\n[Your Contact Information]",
        //         'category' => 'Products & Supplies'
        //     ],
        //     [
        //         'title' => 'Retail Products Proposal',
        //         'content' => "Dear {{client_name}},\n\nOur retail product offerings include a wide range of high-quality items to stock your store.\n\n**Offer Includes:**\n- Detailed catalog with pricing\n- Seasonal promotions\n- Fast shipping options\n\n**Estimated Monthly Order:** \$5,000\n\nWe are excited to supply your retail business.\n\n**Best regards,**\n[Your Name]\n[Your Position]\n[Your Contact Information]",
        //         'category' => 'Products & Supplies'
        //     ],
        //     [
        //         'title' => 'Manufacturing Proposal',
        //         'content' => "Dear {{client_name}},\n\nWe can manufacture the following products to your specifications and volume requirements.\n\n**Offer Includes:**\n- Custom product design\n- Quality control checks\n- Bulk packaging & delivery\n\n**Estimated Lead Time:** 6-8 weeks\n**Cost Estimate:** \$15,000\n\nWe look forward to collaborating on your manufacturing needs.\n\n**Best regards,**\n[Your Name]\n[Your Position]\n[Your Contact Information]",
        //         'category' => 'Products & Supplies'
        //     ],
        
        //     // Events & Entertainment
        //     [
        //         'title' => 'Photography Proposal',
        //         'content' => "Dear {{client_name}},\n\nWe propose a photography package for your event to capture memorable moments professionally.\n\n**Package Includes:**\n- Full-day coverage\n- 200+ edited photos\n- Online gallery access\n\n**Cost:** \$2,000\n\nWe look forward to making your event unforgettable.\n\n**Best regards,**\n[Your Name]\n[Your Position]\n[Your Contact Information]",
        //         'category' => 'Events & Entertainment'
        //     ],
        //     [
        //         'title' => 'Event Planning Proposal',
        //         'content' => "Dear {{client_name}},\n\nOur team can manage your upcoming event including venue selection, logistics, and on-site coordination.\n\n**Services Include:**\n- Event theme & planning\n- Vendor management\n- On-site supervision\n\n**Cost Estimate:** \$8,000\n\nWe are excited to make your event a success.\n\n**Best regards,**\n[Your Name]\n[Your Position]\n[Your Contact Information]",
        //         'category' => 'Events & Entertainment'
        //     ],
        //     [
        //         'title' => 'Catering Proposal',
        //         'content' => "Dear {{client_name}},\n\nWe provide catering services for your event with a customizable menu to delight your guests.\n\n**Offer Includes:**\n- Buffet or plated service\n- Beverage package\n- Professional staff\n\n**Cost Estimate:** \$5,000\n\nWe look forward to catering your special event.\n\n**Best regards,**\n[Your Name]\n[Your Position]\n[Your Contact Information]",
        //         'category' => 'Events & Entertainment'
        //     ],
        
        //     // Extra
        //     [
        //         'title' => 'Social Media Management',
        //         'content' => "Dear {{client_name}},\n\nWe propose managing your social media channels to increase engagement and grow your audience.\n\n**Services:**\n- Content creation & scheduling\n- Community management\n- Analytics & reporting\n\n**Monthly Fee:** \$1,500\n\nWe are excited to enhance your online presence.\n\n**Best regards,**\n[Your Name]\n[Your Position]\n[Your Contact Information]",
        //         'category' => 'Professional Services'
        //     ],
        //     [
        //         'title' => 'SEO Optimization Proposal',
        //         'content' => "Dear {{client_name}},\n\nWe will optimize your website for search engines to improve rankings, traffic, and conversions.\n\n**Services:**\n- Keyword research\n- On-page & off-page SEO\n- Technical audit & fixes\n- Monthly performance report\n\n**Timeline:** 3 months\n**Cost:** \$3,000\n\nWe look forward to boosting your online visibility.\n\n**Best regards,**\n[Your Name]\n[Your Position]\n[Your Contact Information]",
        //         'category' => 'Tech & Web'
        //     ],
        //     [
        //         'title' => 'Corporate Event Proposal',
        //         'content' => "Dear {{client_name}},\n\nWe propose organizing a corporate event that includes venue coordination, catering, and guest management.\n\n**Services:**\n- Event theme & planning\n- Logistics & scheduling\n- Catering & beverage management\n\n**Cost Estimate:** \$12,000\n\nWe look forward to creating a memorable corporate event.\n\n**Best regards,**\n[Your Name]\n[Your Position]\n[Your Contact Information]",
        //         'category' => 'Events & Entertainment'
        //     ],
        // ];        

        foreach ($predefinedContents as $proposal) {
            DB::table('predefined_proposals')->insert([
                'title' => $proposal['title'],
                'content' => $proposal['content'],
                'category' => $proposal['category'],
                'is_public' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
