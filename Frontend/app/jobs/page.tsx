"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  Briefcase,
  MapPin,
  Building2,
  ExternalLink,
  Plus,
  Filter,
  X,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Header } from "@/components/header";
import { MobileNav } from "@/components/mobile-nav";
import { TrustBadge } from "@/components/TrustBadge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  getFilteredJobPosts,
  createJobPost,
  deleteJobPost,
  JobPostResponse,
  JobPostRequest,
} from "@/lib/api";

interface CurrentUser {
  id?: number;
  name: string;
  avatar: string;
  community: string;
  unreadMessageCount?: number;
  unreadNotificationCount?: number;
}

export default function JobsPage() {
  const router = useRouter();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [jobs, setJobs] = useState<JobPostResponse[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<JobPostResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Safety warning dialog state
  const [showSafetyWarning, setShowSafetyWarning] = useState(false);
  const [pendingApplyLink, setPendingApplyLink] = useState<string>("");

  // Filter states
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string>("all");

  // Create job form state
  const [newJob, setNewJob] = useState<JobPostRequest>({
    title: "",
    companyName: "",
    location: "Remote",
    type: "Full-time",
    description: "",
    applyLink: "",
    postedBy: 0,
    profession: "",
  });

  // Load user from session storage
  useEffect(() => {
    const userDataString = sessionStorage.getItem("user");
    if (!userDataString) {
      router.push("/login");
      return;
    }

    try {
      const userData = JSON.parse(userDataString);
      setUser({
        id: userData.id,
        name: userData.name,
        avatar: userData.profileImageUrl || "/placeholder.svg",
        community: userData.profession || "Professional",
        unreadMessageCount: userData.unreadMessageCount || 0,
        unreadNotificationCount: userData.unreadNotificationCount || 0,
      });
      setNewJob((prev) => ({
        ...prev,
        postedBy: userData.id,
        profession: userData.profession,
      }));
    } catch (error) {
      console.error("Error parsing user data:", error);
      router.push("/login");
    }
  }, [router]);

  // Load jobs
  useEffect(() => {
    if (user?.community) {
      loadJobs();
    }
  }, [user?.community]);

  // Apply filters
  useEffect(() => {
    if (jobs.length === 0) {
      setFilteredJobs([]);
      return;
    }

    let filtered = [...jobs];

    if (typeFilter !== "all") {
      filtered = filtered.filter((job) => job.type === typeFilter);
    }

    if (locationFilter !== "all") {
      filtered = filtered.filter((job) => job.location === locationFilter);
    }

    setFilteredJobs(filtered);
  }, [jobs, typeFilter, locationFilter]);

  const loadJobs = async () => {
    if (!user?.community) return;

    setLoading(true);
    try {
      const data = await getFilteredJobPosts(user.community);
      setJobs(data);
    } catch (error) {
      console.error("Error loading jobs:", error);
      toast.error("Failed to load job posts");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJob = async () => {
    if (
      !newJob.title ||
      !newJob.companyName ||
      !newJob.description ||
      !newJob.applyLink
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      await createJobPost(newJob);
      toast.success("Job post created successfully!");
      setIsCreateDialogOpen(false);
      setNewJob({
        title: "",
        companyName: "",
        location: "Remote",
        type: "Full-time",
        description: "",
        applyLink: "",
        postedBy: user?.id || 0,
        profession: user?.community || "",
      });
      loadJobs();
    } catch (error) {
      console.error("Error creating job:", error);
      toast.error("Failed to create job post");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteJob = async (jobId: number) => {
    if (!user?.id) return;

    if (!confirm("Are you sure you want to delete this job post?")) return;

    try {
      await deleteJobPost(jobId, user.id);
      toast.success("Job post deleted successfully!");
      loadJobs();
    } catch (error) {
      console.error("Error deleting job:", error);
      toast.error("Failed to delete job post");
    }
  };

  const handleEasyApply = (applyLink: string, isLinkSafe: boolean) => {
    if (isLinkSafe) {
      window.open(applyLink, "_blank");
    } else {
      // Show safety warning dialog
      setPendingApplyLink(applyLink);
      setShowSafetyWarning(true);
    }
  };

  const proceedWithUnsafeLink = () => {
    if (pendingApplyLink) {
      window.open(pendingApplyLink, "_blank");
    }
    setShowSafetyWarning(false);
    setPendingApplyLink("");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header user={user || undefined} />

      <main className="container mx-auto px-4 py-8 pb-20 md:pb-8 max-w-5xl">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Briefcase className="w-8 h-8 text-primary" />
              Job Opportunities
            </h1>
            <p className="text-muted-foreground mt-2">
              Discover opportunities tailored for {user?.community || "you"}
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Post a Job
          </Button>
        </div>

        {/* Filter Bar */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filters:</span>
              </div>

              <div className="flex-1 flex gap-4 flex-wrap">
                {/* Type Filter */}
                <div className="flex-1 min-w-[200px]">
                  <Label htmlFor="type-filter" className="text-xs text-muted-foreground mb-1 block">
                    Job Type
                  </Label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger id="type-filter">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="Full-time">Full-time</SelectItem>
                      <SelectItem value="Part-time">Part-time</SelectItem>
                      <SelectItem value="Internship">Internship</SelectItem>
                      <SelectItem value="Contract">Contract</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Location Filter */}
                <div className="flex-1 min-w-[200px]">
                  <Label htmlFor="location-filter" className="text-xs text-muted-foreground mb-1 block">
                    Location
                  </Label>
                  <Select value={locationFilter} onValueChange={setLocationFilter}>
                    <SelectTrigger id="location-filter">
                      <SelectValue placeholder="All Locations" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      <SelectItem value="Remote">Remote</SelectItem>
                      <SelectItem value="On-site">On-site</SelectItem>
                      <SelectItem value="Hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {(typeFilter !== "all" || locationFilter !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setTypeFilter("all");
                    setLocationFilter("all");
                  }}
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Job Listings */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredJobs.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Briefcase className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
              <p className="text-muted-foreground">
                {typeFilter !== "all" || locationFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Be the first to post a job opportunity!"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <Card key={job.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    {/* Company/Recruiter Avatar */}
                    <Link href={`/profile/${job.postedBy.id}`}>
                      <Avatar className="w-12 h-12 border-2 border-primary/20">
                        <AvatarImage
                          src={job.postedBy.profileImageUrl || "/placeholder.svg"}
                          alt={job.postedBy.name}
                        />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white">
                          {job.postedBy.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Link>

                    <div className="flex-1">
                      {/* Job Header */}
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-xl font-semibold">{job.title}</h3>
                            <TrustBadge score={job.trustScore} />
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Building2 className="w-4 h-4" />
                            <span>{job.companyName}</span>
                          </div>
                        </div>
                      </div>

                      {/* Job Details */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                          {job.type}
                        </span>
                        <span className="px-3 py-1 bg-secondary/10 text-secondary-foreground text-xs font-medium rounded-full flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {job.location}
                        </span>
                        <span className="px-3 py-1 bg-muted text-muted-foreground text-xs font-medium rounded-full">
                          {formatDate(job.createdAt)}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {job.description}
                      </p>

                      {/* Footer */}
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-muted-foreground">
                          Posted by{" "}
                          <Link
                            href={`/profile/${job.postedBy.id}`}
                            className="text-primary hover:underline"
                          >
                            {job.postedBy.name}
                          </Link>
                        </div>
                        <div className="flex gap-2">
                          {user?.id === job.postedBy.id && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteJob(job.id)}
                            >
                              Delete
                            </Button>
                          )}
                          <Button
                            size="sm"
                            onClick={() => handleEasyApply(job.applyLink, job.isLinkSafe)}
                            className={job.isLinkSafe 
                              ? "bg-gradient-to-r from-primary to-secondary" 
                              : "bg-yellow-600 hover:bg-yellow-700"}
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            {job.isLinkSafe ? "Easy Apply" : "Proceed with Caution"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Create Job Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Post a Job Opportunity</DialogTitle>
            <DialogDescription>
              Share a job opening with your professional community
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="job-title">Job Title *</Label>
              <Input
                id="job-title"
                placeholder="e.g., Senior Software Engineer"
                value={newJob.title}
                onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="company-name">Company Name *</Label>
              <Input
                id="company-name"
                placeholder="e.g., Tech Corp"
                value={newJob.companyName}
                onChange={(e) =>
                  setNewJob({ ...newJob, companyName: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="job-type">Job Type *</Label>
                <Select
                  value={newJob.type}
                  onValueChange={(value) => setNewJob({ ...newJob, type: value })}
                >
                  <SelectTrigger id="job-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Full-time">Full-time</SelectItem>
                    <SelectItem value="Part-time">Part-time</SelectItem>
                    <SelectItem value="Internship">Internship</SelectItem>
                    <SelectItem value="Contract">Contract</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="job-location">Location *</Label>
                <Select
                  value={newJob.location}
                  onValueChange={(value) =>
                    setNewJob({ ...newJob, location: value })
                  }
                >
                  <SelectTrigger id="job-location">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Remote">Remote</SelectItem>
                    <SelectItem value="On-site">On-site</SelectItem>
                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="job-description">Description *</Label>
              <Textarea
                id="job-description"
                placeholder="Describe the role, responsibilities, and requirements..."
                rows={6}
                value={newJob.description}
                onChange={(e) =>
                  setNewJob({ ...newJob, description: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="apply-link">Application Link/Email *</Label>
              <Input
                id="apply-link"
                placeholder="https://company.com/careers or email@company.com"
                value={newJob.applyLink}
                onChange={(e) =>
                  setNewJob({ ...newJob, applyLink: e.target.value })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateJob} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Posting...
                </>
              ) : (
                "Post Job"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Safety Warning Dialog */}
      <Dialog open={showSafetyWarning} onOpenChange={setShowSafetyWarning}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-yellow-600 dark:text-yellow-500">
              <AlertTriangle className="w-5 h-5" />
              Proceed with Caution
            </DialogTitle>
            <DialogDescription>
              This job posting contains a link that may not be safe or verified. 
              The link could redirect to an unknown or suspicious website.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <h4 className="font-semibold text-sm mb-2 text-yellow-800 dark:text-yellow-200">
                Safety Tips:
              </h4>
              <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1 list-disc list-inside">
                <li>Never share personal information via messaging apps</li>
                <li>Be cautious of shortened URLs (bit.ly, t.me, etc.)</li>
                <li>Verify the company independently before applying</li>
                <li>Legitimate employers rarely ask for money upfront</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowSafetyWarning(false);
                setPendingApplyLink("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={proceedWithUnsafeLink}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              I Understand - Proceed Anyway
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <MobileNav />
    </div>
  );
}
