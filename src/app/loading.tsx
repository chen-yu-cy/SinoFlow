import { CourseCardSkeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div>
      <section style={{ padding: "4rem 0", textAlign: "center", marginBottom: "3rem" }}>
        <div className="skeleton-pulse" style={{ width: "300px", height: "3rem", margin: "0 auto 1rem" }} />
        <div className="skeleton-pulse" style={{ width: "600px", height: "1.2rem", margin: "0 auto" }} />
      </section>
      
      <section>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2rem" }}>
          <div className="skeleton-pulse" style={{ width: "150px", height: "2rem" }} />
        </div>
        
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", 
          gap: "2rem" 
        }}>
          {[...Array(4)].map((_, i) => (
            <CourseCardSkeleton key={i} />
          ))}
        </div>
      </section>
    </div>
  );
}
