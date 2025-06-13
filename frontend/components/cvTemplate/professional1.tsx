// components/templates/ProfessionalCV.tsx
const ProfessionalCV1 = ({ data }: { data: any }) => (
    <div>
      <h1>Professional CV</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
  export default ProfessionalCV1;
  