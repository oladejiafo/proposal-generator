// utils/markdownConverter.js
export const convertMarkdownWithHtml = (text) => {
    if (!text) return '';
    
    let converted = text;
    
    // Convert Markdown headers
    converted = converted.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    converted = converted.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    converted = converted.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    converted = converted.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
    
    // Convert bold and italic
    converted = converted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    converted = converted.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Convert lists
    converted = converted.replace(/^- (.*$)/gim, '<li>$1</li>');
    converted = converted.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
    
    // Convert line breaks to <br> but preserve existing HTML
    converted = converted.replace(/\n(?![^<>]*>)/g, '<br>');
    
    return converted;
  };