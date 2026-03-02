const TimeEntry = require("../models/TimeEntry"); 
const Team = require("../models/Team"); //  REQUIRED for team filtering // 
const { uploadToS3 } = require("../config/aws"); 


/* ===================================================================== 
                        CREATE WEEKLY TIME ENTRY 
========================================================================== */ 
exports.createTimeEntry = async (req, res) => { 
  try { 
    const { 
      weekStart, 
      weekEnd, 
      companyType, 
      weeklyTotalHours, 
      dailyHours, 
      description, 
    } = req.body; 

    if (!weekStart || !weekEnd || !companyType) { 
      return res.status(400).json({ 
        error: "Week start, week end and company type are required", 
      }); 
    } 
    
    let totalHours = 0; 
    let parsedDaily = {}; 

    /* ===================== RWS ===================== */ 
    if (companyType === "RWS") { 
      const parsedWeekly = parseFloat(weeklyTotalHours); 
      if (isNaN(parsedWeekly) || parsedWeekly < 0) { 
        return res.status(400).json({ 
          error: "Valid decimal weekly total required" 
        }); 
      } 
      
      totalHours = Number(parsedWeekly.toFixed(2)); 
    } 

    /* ========== Welocalized / Telus ========== */ 
    if (["Welocalized", "Telus"].includes(companyType)) { 
      if (!dailyHours) { 
        return res.status(400).json({ 
          error: "Daily hours required" 
        });
      } 
        
      let dailyData = 
        typeof dailyHours === "string" ? JSON.parse(dailyHours) : 
        dailyHours; 
      for (const [day, value] of Object.entries(dailyData)) { 
        const parsedValue = parseFloat(value || 0); 
        if (isNaN(parsedValue) || parsedValue < 0 || parsedValue > 8) { 
          return res.status(400).json({ error: `${day} cannot exceed 8 hours` 
          }); 
        } 
        parsedDaily[day] = Number(parsedValue.toFixed(2)); 
      } 
      totalHours = Number( 
        Object.values(parsedDaily).reduce((sum, val) => sum + val, 0).toFixed(2) 
      ); 
    } 

    /* ================= PROOF UPLOAD ================= */ 
    let proofUrl = null; 
    if (req.file) { 
      proofUrl = await uploadToS3(req.file, "time-proofs"); 
    } 
    
    const timeEntry = await TimeEntry.create({ 
      userId: req.user._id, 
      weekStart, 
      weekEnd, 
      companyType, 
      weeklyTotalHours: companyType === "RWS" ? totalHours : undefined, 
      dailyHours: companyType !== "RWS" ? parsedDaily : undefined, 
      totalHours, 
      description, 
      proofUrl, 
      status: "pending", 
    }); 
    
    res.status(201).json({ 
      success: true, 
      message: "Weekly time entry submitted successfully", 
      timeEntry, 
    }); 
  } 
  catch (error) { 
    console.error("Create Error:", error); 
    res.status(500).json({ error: "Failed to create time entry" }); 
  } 
}; 
/* ==================================================================
                       GET OWN TIME ENTRIES 
===================================================================== */ 

exports.getTimeEntries = async (req, res) => { 
  try { 
    const timeEntries = await TimeEntry.find({ 
      userId: req.user._id 
    }) 
    .sort({ weekStart: -1 }) 
    .populate("approvedBy", "firstName lastName"); 
    
    res.json({ success: true, timeEntries }); 
  } catch (error) { 
    res.status(500).json({ error: error.message }); 
  } 
}; 
/* ===========================================================
      GET PENDING ENTRIES (FOR APPROVAL PAGE) 
============================================================== */ 

exports.getPendingEntries = async (req, res) => { 
  try { 
    const user = req.user; 
    
    let filter = { status: "pending" }; 
    
    // 🔹 If team-leader → only see their team members //
        if (user.role === "team-leader") { 
          const team = await Team.findOne({ leaderId: user._id }); 
          if (!team) { return res.json({ success: true, timeEntries: [] }); 
        } 
        
        filter.userId = { $in: team.members }; 
      } 
      
      // Admin sees all pending 
        const entries = await TimeEntry.find(filter) 
        .populate("userId", "firstName lastName email") 
        .sort({ createdAt: -1 }); 
        res.json({ success: true, timeEntries: entries, }); 
      } 
      catch (error) { 
        console.error("Pending Fetch Error:", error); 
        res.status(500).json({ error: "Failed to fetch pending entries" }); 
      } 
    }; 

    /* ===========================================================
                    UPDATE TIME ENTRY 
     ============================================================= */ 
    exports.updateTimeEntry = async (req, res) => { 
      try { 
        const { timeEntryId } = req.params; 
        const { 
          weeklyTotalHours, 
          dailyHours, 
          description, 
          weekStart, 
          weekEnd 
        } = req.body; 

          const timeEntry = await TimeEntry.findById(timeEntryId); 
          if (!timeEntry) 
            return res.status(404).json({ error: "Time entry not found" }); 
          
          if (timeEntry.status === "approved") { 
            return res 
            .status(400) 
            .json({ error: "Approved entries cannot be edited" }); 
          } 
          
          const isOwner = 
            timeEntry.userId.toString() === req.user._id.toString(); 
          const isLeaderOrAdmin = ["team-leader", "admin"].includes(req.user.role); 

          if (!isOwner && !isLeaderOrAdmin) { 
            return res.status(403).json({ error: "Not authorized" }); 
          } 
            
          if (weekStart) timeEntry.weekStart = weekStart; 
          
          if (weekEnd) timeEntry.weekEnd = weekEnd; 
          
          if (description !== undefined) 
            timeEntry.description = description; 
          
          if (timeEntry.companyType === "RWS" && weeklyTotalHours !== undefined) { 
            const parsed = parseFloat(weeklyTotalHours); 
            
            if (!isNaN(parsed)) { 
              timeEntry.weeklyTotalHours = Number(parsed.toFixed(2)); 
              timeEntry.totalHours = Number(parsed.toFixed(2)); 
            } 
            
          } 
          
          if (
            
            ["Welocalized", "Telus"].includes(timeEntry.companyType) && 
            dailyHours) { 
              let dailyData = 
              typeof dailyHours === "string" 
              ? JSON.parse(dailyHours) 
              : dailyHours; 
              
              const parsedDaily = {}; 
              
              for (const [day, value] of Object.entries(dailyData)) { 
                const val = parseFloat(value || 0); 
                parsedDaily[day] = Number(val.toFixed(2)
              
              ); 
            } 
            
            timeEntry.dailyHours = parsedDaily; 
            timeEntry.totalHours = Number( 
              Object.values(parsedDaily)
              .reduce((s, v) => s + v, 0)
              .toFixed(2) 
            ); 
          } 
          
          if (req.file) { 
            timeEntry.proofUrl = await uploadToS3(req.file, "time-proofs"); 
          
          } 
          
          await timeEntry.save(); 
          res.json({ success: true, 
            message: "Updated successfully", 
            timeEntry,
          }); 
        } catch (error) { 
          console.error("Update Error:", error); 
          res.status(500).json({ error: "Failed to update" }); 
        } 
      }; 
      
      /* ============== APPROVE TIME ENTRY =================== */ 
      exports.approveTimeEntry = async (req, res) => { 
        try { 
          const { timeEntryId } = req.params; 
          
          const timeEntry = await TimeEntry.findById(timeEntryId); 
          if (!timeEntry || timeEntry.status === "approved") { 
            return res 
            .status(400) 
            .json({ error: "Invalid entry or already approved" 

            }); 
          } 

          timeEntry.status = "approved"; 
          timeEntry.approvedBy = req.user._id; 
          timeEntry.approvedAt = new Date();

          await timeEntry.save(); 

          res.json({ success: true, 
            message: "Approved successfully", 
            timeEntry, 
          }); 
        } catch (error) { res.status(500).json({ error: "Failed to approve" });
        } 
      };

      /* ======================================================
                        REJECT TIME ENTRY
          ====================================================== */
exports.rejectTimeEntry = async (req, res) => {
  try {
    const { timeEntryId } = req.params;
    const { reason } = req.body;

    const timeEntry = await TimeEntry.findById(timeEntryId);

    if (!timeEntry || timeEntry.status !== "pending") {
      return res.status(400).json({
        error: "Invalid entry or already processed",
      });
    }

    // restrict team leader to own team
    if (req.user.role === "team-leader") {
      const team = await Team.findOne({ leaderId: req.user._id });

      if (!team || !team.members.includes(timeEntry.userId)) {
        return res.status(403).json({
          error: "Not authorized to reject this entry",
        });
      }
    }

    timeEntry.status = "rejected";
    timeEntry.rejectedBy = req.user._id;
    timeEntry.rejectedAt = new Date();
    timeEntry.rejectionReason = reason || "No reason provided";

    await timeEntry.save();

    res.json({
      success: true,
      message: "Time entry rejected successfully",
      timeEntry,
    });

  } catch (error) {
    console.error("Reject Error:", error);
    res.status(500).json({ error: "Failed to reject entry" });
  }
};