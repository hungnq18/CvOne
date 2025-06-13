// components/templates/ModernCV.tsx
const MinimalistCV1 = ({ data }: { data: any }) => (
    <div>
      <h1>Modern CV</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
      {/* ...render data thành UI đẹp */}
    </div>
  );
  export default MinimalistCV1;
  