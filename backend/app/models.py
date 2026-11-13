import datetime
from sqlalchemy import Column, Integer, Float, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(String, unique=True, index=True, nullable=False)
    age = Column(Integer, nullable=False)
    disease_stage = Column(String, nullable=False)
    molecular_subtype = Column(String, nullable=False)
    er_status = Column(String, nullable=False)
    pr_status = Column(String, nullable=False)
    her2_status = Column(String, nullable=False)
    ki67_percent = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    genomic_profile = relationship("GenomicProfile", back_populates="patient", uselist=False, cascade="all, delete-orphan")
    transcriptomic_profile = relationship("TranscriptomicProfile", back_populates="patient", uselist=False, cascade="all, delete-orphan")
    analysis_result = relationship("AnalysisResult", back_populates="patient", uselist=False, cascade="all, delete-orphan")
    strategy_report = relationship("StrategyReport", back_populates="patient", uselist=False, cascade="all, delete-orphan")

class GenomicProfile(Base):
    __tablename__ = "genomic_profiles"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(String, ForeignKey("patients.patient_id"), unique=True, nullable=False)
    brca1_mutation = Column(Integer, default=0) # 0: Wild-type, 1: Pathogenic variant
    brca2_mutation = Column(Integer, default=0)
    pik3ca_mutation = Column(Integer, default=0)
    tp53_mutation = Column(Integer, default=0)
    esr1_mutation = Column(Integer, default=0)
    her2_amplification = Column(Integer, default=0)

    patient = relationship("Patient", back_populates="genomic_profile")

class TranscriptomicProfile(Base):
    __tablename__ = "transcriptomic_profiles"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(String, ForeignKey("patients.patient_id"), unique=True, nullable=False)
    esr1_expression = Column(Float, nullable=False)
    pgr_expression = Column(Float, nullable=False)
    erbb2_expression = Column(Float, nullable=False)
    mki67_expression = Column(Float, nullable=False)
    egfr_expression = Column(Float, nullable=False)
    brca1_expression = Column(Float, nullable=False)
    brca2_expression = Column(Float, nullable=False)
    pik3ca_expression = Column(Float, nullable=False)

    patient = relationship("Patient", back_populates="transcriptomic_profile")

class AnalysisResult(Base):
    __tablename__ = "analysis_results"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(String, ForeignKey("patients.patient_id"), unique=True, nullable=False)
    cluster_id = Column(Integer, nullable=False)
    cluster_name = Column(String, nullable=False)
    pca_x = Column(Float, nullable=False)
    pca_y = Column(Float, nullable=False)
    predicted_response = Column(String, nullable=False)
    response_confidence = Column(Float, nullable=False)
    response_probabilities = Column(Text, nullable=False) # JSON string
    analyzed_at = Column(DateTime, default=datetime.datetime.utcnow)

    patient = relationship("Patient", back_populates="analysis_result")

class StrategyReport(Base):
    __tablename__ = "strategy_reports"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(String, ForeignKey("patients.patient_id"), unique=True, nullable=False)
    molecular_summary = Column(Text, nullable=False)
    potential_pathways = Column(Text, nullable=False) # JSON string array
    scientific_justifications = Column(Text, nullable=False) # JSON string array
    limitations = Column(Text, nullable=False) # JSON string array
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    patient = relationship("Patient", back_populates="strategy_report")
