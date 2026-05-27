<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; color: #333; background: #f8fafc; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; }
        .header { background: #064e3b; color: #fff; padding: 24px 32px; }
        .header h1 { margin: 0; font-size: 18px; font-weight: bold; }
        .header p { margin: 4px 0 0; font-size: 12px; color: #6ee7b7; }
        .body { padding: 32px; }
        .ref-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px 20px; margin: 20px 0; text-align: center; }
        .ref-box .label { font-size: 11px; color: #6b7280; margin-bottom: 4px; }
        .ref-box .ref { font-size: 22px; font-weight: bold; color: #065f46; letter-spacing: 2px; }
        .field { margin-bottom: 12px; }
        .field .key { font-size: 11px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px; }
        .field .val { font-size: 14px; color: #111827; font-weight: 500; }
        .services { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px; }
        .tag { background: #f3f4f6; color: #374151; font-size: 12px; padding: 3px 10px; border-radius: 20px; }
        .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 32px; font-size: 12px; color: #9ca3af; }
    </style>
</head>
<body>
<div class="container">
    <div class="header">
        <h1>CVSU-CELLAR DMS</h1>
        <p>Research Center — Client Request Confirmation</p>
    </div>
    <div class="body">
        <p>Dear <strong>{{ $request->client_name }}</strong>,</p>
        <p>Thank you for submitting your service request to CVSU-CELLAR. We have received your request and it is currently under review.</p>

        <div class="ref-box">
            <div class="label">Your Reference Number</div>
            <div class="ref">{{ $request->reference_number }}</div>
        </div>

        <p>Please keep this reference number for any follow-up inquiries.</p>

        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0">

        <div class="field">
            <div class="key">Date Submitted</div>
            <div class="val">{{ \Carbon\Carbon::parse($request->request_date)->format('F j, Y') }}</div>
        </div>
        <div class="field">
            <div class="key">Name</div>
            <div class="val">{{ $request->client_name }}</div>
        </div>
        <div class="field">
            <div class="key">Email</div>
            <div class="val">{{ $request->email }}</div>
        </div>
        <div class="field">
            <div class="key">Occupation</div>
            <div class="val">{{ $request->occupation }}</div>
        </div>
        @if($request->agency)
        <div class="field">
            <div class="key">Agency / Institution</div>
            <div class="val">{{ $request->agency }}</div>
        </div>
        @endif
        <div class="field">
            <div class="key">Services Requested</div>
            <div class="services">
                @foreach($request->services ?? [] as $svc)
                    <span class="tag">{{ ucwords(str_replace('_', ' ', $svc)) }}</span>
                @endforeach
            </div>
        </div>
        @if($request->translation_document)
        <div class="field">
            <div class="key">Document for Translation/Editing</div>
            <div class="val">{{ $request->translation_document }}</div>
        </div>
        @endif
        @if($request->research_title)
        <div class="field">
            <div class="key">Research Title</div>
            <div class="val">{{ $request->research_title }}</div>
        </div>
        @endif

        <p style="margin-top:24px;font-size:13px;color:#6b7280;">
            The CELLAR team will review your request and contact you at this email address.
            If you have questions, please reply to this email with your reference number.
        </p>
    </div>
    <div class="footer">
        CVSU-CELLAR Document Management System &nbsp;|&nbsp; Cavite State University
    </div>
</div>
</body>
</html>
