import jwt from 'jsonwebtoken';
export const auth=(req,res,next)=>{try{const token=req.cookies.token; if(!token)return res.status(401).json({message:'Authentication required'});req.user=jwt.verify(token,process.env.JWT_SECRET);next()}catch{res.status(401).json({message:'Invalid session'})}};
export const error=(err,req,res,next)=>{console.error(err);res.status(err.status||500).json({message:err.message||'Internal server error'})};
export const validate=(schema)=> (req,res,next)=>{const result=schema.safeParse(req.body);if(!result.success)return res.status(400).json({message:'Validation failed',errors:result.error.flatten()});req.body=result.data;next()};
