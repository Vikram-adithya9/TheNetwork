module.exports = {
    onCreate: {
      subject: "Alliance Created Successfully",
      content: (data) => `
        <h3>Hello ${data.userName},</h3>
        <p>Congratulations! Your alliance <strong>${data.allianceName}</strong> has been successfully created.</p>
        <p>We are excited to see you build this community. Feel free to invite others to join!</p>
        <p><strong>Details:</strong></p>
        <ul>
          <li><strong>Alliance Name:</strong> ${data.allianceName}</li>
          <li><strong>Created By:</strong> ${data.creatorName}</li>
          <li><strong>Destinations:</strong> ${data.destinations.join(', ')}</li>
          <li><strong>Target Date:</strong> ${data.targetDate}</li>
        </ul>
        <p>We wish you the best in your journey with CampusConnect!</p>
        <br/>
        <p>Regards,</p>
        <p>Team CampusConnect</p>
      `
    },
  
    onKickMember: {
      subject: "You Have Been Kicked from an Alliance",
      content: (data) => `
        <h3>Hello ${data.userName},</h3>
        <p>We regret to inform you that you have been removed from the alliance <strong>"${data.allianceName}"</strong> by the alliance creator.</p>
        <p>If you need assistance or wish to join other alliances, please feel free to reach out.</p>
        <p><strong>Details:</strong></p>
        <ul>
          <li><strong>Alliance Name:</strong> ${data.allianceName}</li>
          <li><strong>Creator:</strong> ${data.creatorName}</li>
        </ul>
        <br/>
        <p>Best regards,</p>
        <p>Team CampusConnect</p>
      `
    },
  
    onRequestApprove: {
      subject: "Your Alliance Request Has Been Approved",
      content: (data) => `
        <h3>Hello ${data.userName},</h3>
        <p>Congratulations! Your request to join the alliance <strong>"${data.allianceName}"</strong> has been approved.</p>
        <p>We're excited to have you join and wish you a great experience with us.</p>
        <p><strong>Alliance Details:</strong></p>
        <ul>
          <li><strong>Alliance Name:</strong> ${data.allianceName}</li>
          <li><strong>Creator:</strong> ${data.creatorName}</li>
          <li><strong>Destinations:</strong> ${data.destinations.join(', ')}</li>
          <li><strong>Target Date:</strong> ${data.targetDate}</li>
        </ul>
        <br/>
        <p>Regards,</p>
        <p>Team CampusConnect</p>
      `
    },
  
    onRequestReject: {
      subject: "Your Alliance Request Has Been Rejected",
      content: (data) => `
        <h3>Hello ${data.userName},</h3>
        <p>We regret to inform you that your request to join the alliance <strong>"${data.allianceName}"</strong> has been rejected.</p>
        <p>Don't be discouraged! Feel free to explore other alliances or reach out if you need assistance.</p>
        <p><strong>Alliance Details:</strong></p>
        <ul>
          <li><strong>Alliance Name:</strong> ${data.allianceName}</li>
          <li><strong>Creator:</strong> ${data.creatorName}</li>
        </ul>
        <br/>
        <p>Best regards,</p>
        <p>Team CampusConnect</p>
      `
    },
  
    // Add more templates as needed
  
    onNewRequest: {
      subject: "New Join Request for Your Alliance",
      content: (data) => `
        <h3>Hello ${data.creatorName},</h3>
        <p>You've received a new join request for the alliance <strong>"${data.allianceName}"</strong> from ${data.requestorName}.</p>
        <p>Please review the request and approve or reject it as appropriate.</p>
        <p><strong>Alliance Details:</strong></p>
        <ul>
          <li><strong>Alliance Name:</strong> ${data.allianceName}</li>
          <li><strong>Requestor:</strong> ${data.requestorName}</li>
        </ul>
        <br/>
        <p>Regards,</p>
        <p>Team CampusConnect</p>
      `
    },
  };
  